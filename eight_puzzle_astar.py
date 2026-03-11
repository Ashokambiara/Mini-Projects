import heapq
from itertools import count

GOAL = ((1, 2, 3),
        (4, 5, 6),
        (7, 8, 0))


def heuristic(state):
    """Return Manhattan distance for a 3x3 8-puzzle state."""
    distance = 0
    for i in range(3):
        for j in range(3):
            value = state[i][j]
            if value == 0:
                continue
            goal_x = (value - 1) // 3
            goal_y = (value - 1) % 3
            distance += abs(i - goal_x) + abs(j - goal_y)
    return distance


def find_zero(state):
    for i in range(3):
        for j in range(3):
            if state[i][j] == 0:
                return i, j
    raise ValueError("State does not contain a blank tile (0).")


def get_neighbors(state):
    """Yield neighboring states by sliding one tile into the blank."""
    x, y = find_zero(state)
    directions = ((1, 0), (-1, 0), (0, 1), (0, -1))

    for dx, dy in directions:
        nx, ny = x + dx, y + dy
        if 0 <= nx < 3 and 0 <= ny < 3:
            grid = [list(row) for row in state]
            grid[x][y], grid[nx][ny] = grid[nx][ny], grid[x][y]
            yield tuple(tuple(row) for row in grid)


def is_solvable(state):
    """8-puzzle is solvable iff inversion count is even."""
    flat = [n for row in state for n in row if n != 0]
    inversions = 0
    for i, a in enumerate(flat):
        for b in flat[i + 1:]:
            if a > b:
                inversions += 1
    return inversions % 2 == 0


def reconstruct_path(parents, end_state):
    path = [end_state]
    while parents[path[-1]] is not None:
        path.append(parents[path[-1]])
    path.reverse()
    return path


def solve(start):
    start = tuple(tuple(row) for row in start)

    if not is_solvable(start):
        return None

    pq = []
    tiebreaker = count()

    g_score = {start: 0}
    parents = {start: None}

    heapq.heappush(pq, (heuristic(start), next(tiebreaker), start))

    while pq:
        _, _, current = heapq.heappop(pq)

        if current == GOAL:
            return reconstruct_path(parents, current)

        current_g = g_score[current]
        for neighbor in get_neighbors(current):
            tentative_g = current_g + 1
            if tentative_g < g_score.get(neighbor, float("inf")):
                g_score[neighbor] = tentative_g
                parents[neighbor] = current
                f_score = tentative_g + heuristic(neighbor)
                heapq.heappush(pq, (f_score, next(tiebreaker), neighbor))

    return None


def print_solution(solution):
    if not solution:
        print("No solution found.")
        return

    for step, state in enumerate(solution):
        print(f"Step {step}")
        for row in state:
            print(list(row))
        print()


if __name__ == "__main__":
    start = ((7, 2, 4),
             (5, 0, 6),
             (8, 3, 1))

    solution = solve(start)
    print_solution(solution)
