package com.tictactoe.tictactoe.service;

import com.tictactoe.tictactoe.model.GameResponse;
import com.tictactoe.tictactoe.model.PlayerState;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameService {

    private final Map<String, PlayerState> playerStorage = new ConcurrentHashMap<>();

    public PlayerState loadPlayer(String username) {
        return playerStorage.computeIfAbsent(username, PlayerState::new);
    }

    public PlayerState savePlayer(PlayerState state) {
        playerStorage.put(state.getUsername(), state);
        return state;
    }

    public GameResponse checkGameState(String boardStr, String playerSide) {
        GameResponse response = new GameResponse();
        response.setBoard(boardStr);

        String[] board = boardStr.split(",", -1);
        int[][] winLines = {
            {0, 1, 2}, {3, 4, 5}, {6, 7, 8},
            {0, 3, 6}, {1, 4, 7}, {2, 5, 8},
            {0, 4, 8}, {2, 4, 6}
        };

        boolean hasEmpty = false;
        String winner = null;

        for (int[] line : winLines) {
            String a = getCell(board, line[0]);
            String b = getCell(board, line[1]);
            String c = getCell(board, line[2]);

            if (!a.isEmpty() && a.equals(b) && a.equals(c)) {
                winner = a;
                response.setWinningLine(line);
                break;
            }
        }

        if (winner != null) {
            response.setStatus(winner.equals(playerSide) ? "WIN" : "LOSS");
            return response;
        }

        for (String cell : board) {
            if (cell.isEmpty()) {
                hasEmpty = true;
                break;
            }
        }

        response.setStatus(hasEmpty ? "ONGOING" : "DRAW");
        return response;
    }

    private String getCell(String[] board, int index) {
        if (index >= board.length) return "";
        return board[index];
    }
}
