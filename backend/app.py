from __future__ import annotations

import json
from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path
from threading import Lock
from typing import Any

from flask import Flask, jsonify, request

DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001"


@dataclass(frozen=True)
class Location:
    id: str
    name: str
    description: str
    latitude: float
    longitude: float
    challenge_id: str


@dataclass(frozen=True)
class Story:
    id: str
    title: str
    description: str
    completion_title: str
    completion_text: str
    reward: str


@dataclass(frozen=True)
class Fragment:
    id: str
    story_id: str
    title: str
    text: str
    order: int


@dataclass(frozen=True)
class Challenge:
    id: str
    location_id: str
    prompt: str
    hint: str
    fragment_id: str
    answer_hashes: frozenset[str]


STORIES = [
    Story(
        id="timisoara-colours",
        title="Colours of the Union Square",
        description="A short story about the architecture and character of Piața Unirii.",
        completion_title="The square comes alive",
        completion_text=(
            "You assembled the story of a square whose colours preserve centuries of Timișoara."
        ),
        reward="Union Square storyteller badge",
    )
]

LOCATIONS = [
    Location(
        id="union-square",
        name="Piața Unirii",
        description="A historic square at the heart of old Timișoara.",
        latitude=45.7581,
        longitude=21.2300,
        challenge_id="union-square-gate",
    ),
    Location(
        id="victory-square",
        name="Piața Victoriei",
        description="A central promenade connecting the Opera and the Orthodox Cathedral.",
        latitude=45.7537,
        longitude=21.2257,
        challenge_id="victory-square-gate",
    ),
]

FRAGMENTS = [
    Fragment(
        id="union-square-fragment-1",
        story_id="timisoara-colours",
        title="A square of light",
        text="The warm facades of Piața Unirii helped earn it the name of the Yellow Square.",
        order=1,
    ),
    Fragment(
        id="union-square-fragment-2",
        story_id="timisoara-colours",
        title="Layers of the city",
        text="The square preserves a visible conversation between several centuries of Timișoara.",
        order=2,
    ),
]


def _answer_hash(answer: str) -> str:
    normalized = " ".join(answer.lower().split())
    return sha256(normalized.encode("utf-8")).hexdigest()


CHALLENGES = [
    Challenge(
        id="union-square-gate",
        location_id="union-square",
        prompt="Which colour gives Piața Unirii its popular nickname?",
        hint="Look closely at the facades surrounding the square.",
        fragment_id="union-square-fragment-1",
        answer_hashes=frozenset({_answer_hash("yellow"), _answer_hash("galben")}),
    ),
    Challenge(
        id="victory-square-gate",
        location_id="victory-square",
        prompt="What kind of place connects the two ends of this central promenade?",
        hint="Think of a public space where people walk and gather.",
        fragment_id="union-square-fragment-2",
        answer_hashes=frozenset({_answer_hash("square"), _answer_hash("piață")}),
    ),
]


def create_app(config: dict[str, Any] | None = None) -> Flask:
    app = Flask(__name__)
    if config:
        app.config.update(config)
    progress_path = Path(
        app.config.get("PROGRESS_PATH", Path(__file__).parent / "data" / "progress.json")
    )
    progress_lock = Lock()

    def load_progress() -> tuple[dict[str, set[str]], dict[str, set[str]]]:
        if not progress_path.exists():
            return {}, {}
        try:
            data = json.loads(progress_path.read_text(encoding="utf-8"))
            return (
                {user: set(ids) for user, ids in data.get("collected", {}).items()},
                {user: set(ids) for user, ids in data.get("completed", {}).items()},
            )
        except (OSError, json.JSONDecodeError) as error:
            app.logger.error("Could not load progress from %s: %s", progress_path, error)
            return {}, {}

    collected_by_user, completed_by_user = load_progress()

    def save_progress() -> None:
        progress_path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "collected": {user: sorted(ids) for user, ids in collected_by_user.items()},
            "completed": {user: sorted(ids) for user, ids in completed_by_user.items()},
        }
        temporary_path = progress_path.with_suffix(".tmp")
        temporary_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        temporary_path.replace(progress_path)

    def current_user_id() -> str:
        return request.headers.get("X-User-Id", DEFAULT_USER_ID)

    @app.get("/health")
    def health() -> Any:
        return jsonify({"status": "ok"})

    @app.get("/locations")
    def list_locations() -> Any:
        return jsonify({"locations": [_location_response(location) for location in LOCATIONS]})

    @app.get("/locations/<location_id>")
    def get_location(location_id: str) -> Any:
        location = next((item for item in LOCATIONS if item.id == location_id), None)
        if location is None:
            return jsonify({"error": "Location not found"}), 404
        return jsonify(_location_response(location))

    @app.get("/stories")
    def list_stories() -> Any:
        return jsonify({"stories": [_story_response(story) for story in STORIES]})

    @app.get("/stories/<story_id>/progress")
    def story_progress(story_id: str) -> Any:
        story = next((item for item in STORIES if item.id == story_id), None)
        if story is None:
            return jsonify({"error": "Story not found"}), 404
        user_fragments = collected_by_user.get(current_user_id(), set())
        fragments = [fragment for fragment in FRAGMENTS if fragment.story_id == story_id]
        collected = [fragment for fragment in fragments if fragment.id in user_fragments]
        completed = bool(fragments) and len(collected) == len(fragments)
        return jsonify(
            {
                "story": _story_response(story),
                "collected": len(collected),
                "total": len(fragments),
                "progress": len(collected) / len(fragments) if fragments else 0,
                "completed": completed,
                "completion": _completion_response(story) if completed else None,
            }
        )

    @app.get("/challenges/<challenge_id>")
    def get_challenge(challenge_id: str) -> Any:
        challenge = next((item for item in CHALLENGES if item.id == challenge_id), None)
        if challenge is None:
            return jsonify({"error": "Challenge not found"}), 404
        return jsonify(
            {
                "id": challenge.id,
                "locationId": challenge.location_id,
                "prompt": challenge.prompt,
                "hint": challenge.hint,
            }
        )

    @app.post("/challenges/<challenge_id>/solve")
    def solve_challenge(challenge_id: str) -> Any:
        challenge = next((item for item in CHALLENGES if item.id == challenge_id), None)
        if challenge is None:
            return jsonify({"error": "Challenge not found"}), 404
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return jsonify({"error": "A JSON object with an answer is required"}), 400
        answer = payload.get("answer")
        if not isinstance(answer, str) or not answer.strip():
            return jsonify({"error": "A non-empty answer is required"}), 400
        if _answer_hash(answer) not in challenge.answer_hashes:
            return jsonify({"correct": False, "message": "That answer is not correct yet."})

        user_id = current_user_id()
        completed = completed_by_user.setdefault(user_id, set())
        collected = collected_by_user.setdefault(user_id, set())
        already_collected = challenge.id in completed
        with progress_lock:
            completed.add(challenge.id)
            collected.add(challenge.fragment_id)
            save_progress()
        story = next(
            story for story in STORIES if story.id == _fragment(challenge.fragment_id).story_id
        )
        story_fragments = [fragment for fragment in FRAGMENTS if fragment.story_id == story.id]
        story_completed = all(fragment.id in collected for fragment in story_fragments)
        return jsonify(
            {
                "correct": True,
                "alreadyCollected": already_collected,
                "message": (
                    "Challenge completed."
                    if not already_collected
                    else "Fragment already collected."
                ),
                "fragment": _fragment_response(challenge.fragment_id),
                "storyCompleted": story_completed,
                "completion": _completion_response(story) if story_completed else None,
            }
        )

    @app.get("/collection")
    def collection() -> Any:
        collected_ids = collected_by_user.get(current_user_id(), set())
        all_fragment_ids = {fragment.id for fragment in FRAGMENTS}
        fragments = [
            {
                **_fragment_response(fragment.id),
                "collected": fragment.id in collected_ids,
                "text": fragment.text if fragment.id in collected_ids else None,
            }
            for fragment in FRAGMENTS
        ]
        stories = []
        for story in STORIES:
            story_fragments = [fragment for fragment in FRAGMENTS if fragment.story_id == story.id]
            collected_count = sum(fragment.id in collected_ids for fragment in story_fragments)
            stories.append(
                {
                    **_story_response(story),
                    "collected": collected_count,
                    "total": len(story_fragments),
                    "progress": collected_count / len(story_fragments) if story_fragments else 0,
                    "completed": bool(story_fragments) and collected_count == len(story_fragments),
                    "completion": (
                        _completion_response(story)
                        if story_fragments and collected_count == len(story_fragments)
                        else None
                    ),
                }
            )
        return jsonify(
            {
                "fragments": fragments,
                "stories": stories,
                "collected": len(collected_ids.intersection(all_fragment_ids)),
                "total": len(FRAGMENTS),
                "progress": (
                    len(collected_ids.intersection(all_fragment_ids)) / len(FRAGMENTS)
                    if FRAGMENTS
                    else 0
                ),
            }
        )

    return app


def _location_response(location: Location) -> dict[str, Any]:
    return {
        "id": location.id,
        "name": location.name,
        "description": location.description,
        "latitude": location.latitude,
        "longitude": location.longitude,
        "challengeId": location.challenge_id,
    }


def _story_response(story: Story) -> dict[str, Any]:
    return {"id": story.id, "title": story.title, "description": story.description}


def _completion_response(story: Story) -> dict[str, str]:
    return {
        "title": story.completion_title,
        "text": story.completion_text,
        "reward": story.reward,
    }


def _fragment(fragment_id: str) -> Fragment:
    return next(fragment for fragment in FRAGMENTS if fragment.id == fragment_id)


def _fragment_response(fragment_id: str) -> dict[str, Any]:
    fragment = _fragment(fragment_id)
    return {
        "id": fragment.id,
        "storyId": fragment.story_id,
        "title": fragment.title,
        "text": fragment.text,
        "order": fragment.order,
    }


app = create_app()
