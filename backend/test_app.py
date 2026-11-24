import pytest

from app import create_app


@pytest.fixture()
def client(tmp_path):
    return create_app({"PROGRESS_PATH": tmp_path / "progress.json"}).test_client()


def test_health_and_locations(client):
    assert client.get("/health").get_json() == {"status": "ok"}
    response = client.get("/locations")
    assert response.status_code == 200
    assert len(response.get_json()["locations"]) == 2


def test_location_and_unknown_location(client):
    assert client.get("/locations/union-square").get_json()["name"] == "Piața Unirii"
    assert client.get("/locations/missing").status_code == 404


def test_stories_and_progress(client):
    stories = client.get("/stories").get_json()["stories"]
    assert stories[0]["id"] == "timisoara-colours"
    progress = client.get("/stories/timisoara-colours/progress").get_json()
    assert progress == {
        "story": stories[0],
        "collected": 0,
        "total": 2,
        "progress": 0,
        "completed": False,
        "completion": None,
    }


def test_correct_answer_awards_fragment_once(client):
    first = client.post("/challenges/union-square-gate/solve", json={"answer": "  Yellow "})
    assert first.get_json()["correct"] is True
    assert first.get_json()["alreadyCollected"] is False
    second = client.post("/challenges/union-square-gate/solve", json={"answer": "yellow"})
    assert second.get_json()["alreadyCollected"] is True
    assert client.get("/collection").get_json()["collected"] == 1


def test_story_completion_and_reward_are_returned_after_all_fragments(client):
    client.post("/challenges/union-square-gate/solve", json={"answer": "yellow"})
    result = client.post(
        "/challenges/victory-square-gate/solve", json={"answer": "square"}
    ).get_json()
    assert result["storyCompleted"] is True
    assert result["completion"]["reward"] == "Union Square storyteller badge"
    progress = client.get("/stories/timisoara-colours/progress").get_json()
    assert progress["completed"] is True
    assert progress["completion"]["title"] == "The square comes alive"


def test_incorrect_answer_does_not_award_fragment(client):
    response = client.post("/challenges/union-square-gate/solve", json={"answer": "wrong"})
    assert response.get_json()["correct"] is False
    assert client.get("/collection").get_json()["collected"] == 0


def test_collection_is_scoped_to_user(client):
    client.post(
        "/challenges/union-square-gate/solve",
        json={"answer": "yellow"},
        headers={"X-User-Id": "user-a"},
    )
    assert client.get("/collection", headers={"X-User-Id": "user-a"}).get_json()["collected"] == 1
    assert client.get("/collection", headers={"X-User-Id": "user-b"}).get_json()["collected"] == 0


def test_invalid_answer_and_unknown_challenge(client):
    assert client.post("/challenges/union-square-gate/solve", json={}).status_code == 400
    assert client.post("/challenges/union-square-gate/solve", json=[]).status_code == 400
    assert client.get("/challenges/missing").status_code == 404


def test_duplicate_challenge_does_not_increase_collection(client):
    client.post("/challenges/union-square-gate/solve", json={"answer": "yellow"})
    client.post("/challenges/union-square-gate/solve", json={"answer": "yellow"})
    collection = client.get("/collection").get_json()
    assert collection["collected"] == 1
    assert sum(fragment["collected"] for fragment in collection["fragments"]) == 1


def test_progress_survives_backend_restart(tmp_path):
    first_client = create_app({"PROGRESS_PATH": tmp_path / "progress.json"}).test_client()
    first_client.post("/challenges/union-square-gate/solve", json={"answer": "yellow"})

    restarted_client = create_app({"PROGRESS_PATH": tmp_path / "progress.json"}).test_client()
    collection = restarted_client.get("/collection").get_json()
    assert collection["collected"] == 1
    assert collection["fragments"][0]["collected"] is True
