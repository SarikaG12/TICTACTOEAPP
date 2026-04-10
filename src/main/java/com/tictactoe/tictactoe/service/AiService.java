package com.tictactoe.tictactoe.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class AiService {

    private final Random random = new Random();

    public int determineMove(String boardStr, String aiSide, String difficulty, int levelNumber) {
        String[] board = parseBoard(boardStr);
        String playerSide = aiSide.equals("X") ? "O" : "X";

        // Hardness scaling: even on lower difficulties, higher levels increase chance of optimal move
        double optimalChance;
        if (difficulty.equals("Hard")) {
            optimalChance = 1.0;
        } else if (difficulty.equals("Medium")) {
            optimalChance = 0.5 + (Math.min(levelNumber, 100) / 200.0); // 50% to 100% depending on level
        } else {
            optimalChance = 0.1 + (Math.min(levelNumber, 150) / 300.0); // 10% to 60% depending on level
        }

        if (Math.random() < optimalChance) {
            int move = findBestMove(board, aiSide, playerSide);
            if (move != -1) return move;
        }

        return getRandomMove(board);
    }

    public int getHint(String boardStr, String playerSide) {
        String[] board = parseBoard(boardStr);
        String aiSide = playerSide.equals("X") ? "O" : "X";
        int move = findBestMove(board, playerSide, aiSide);
        return move != -1 ? move : getRandomMove(board);
    }

    private int findBestMove(String[] board, String maxPlayer, String minPlayer) {
        int bestVal = Integer.MIN_VALUE;
        int bestMove = -1;

        for (int i = 0; i < 9; i++) {
            if (board[i].isEmpty()) {
                board[i] = maxPlayer;
                int moveVal = minimax(board, 0, false, maxPlayer, minPlayer, Integer.MIN_VALUE, Integer.MAX_VALUE);
                board[i] = "";

                if (moveVal > bestVal) {
                    bestMove = i;
                    bestVal = moveVal;
                }
            }
        }
        return bestMove;
    }

    private int minimax(String[] board, int depth, boolean isMax, String maxPlayer, String minPlayer, int alpha, int beta) {
        int score = evaluate(board, maxPlayer, minPlayer);
        if (score == 10) return score - depth;
        if (score == -10) return score + depth;
        if (!hasEmptyCells(board)) return 0;

        if (isMax) {
            int best = Integer.MIN_VALUE;
            for (int i = 0; i < 9; i++) {
                if (board[i].isEmpty()) {
                    board[i] = maxPlayer;
                    best = Math.max(best, minimax(board, depth + 1, false, maxPlayer, minPlayer, alpha, beta));
                    board[i] = "";
                    alpha = Math.max(alpha, best);
                    if (beta <= alpha) break;
                }
            }
            return best;
        } else {
            int best = Integer.MAX_VALUE;
            for (int i = 0; i < 9; i++) {
                if (board[i].isEmpty()) {
                    board[i] = minPlayer;
                    best = Math.min(best, minimax(board, depth + 1, true, maxPlayer, minPlayer, alpha, beta));
                    board[i] = "";
                    beta = Math.min(beta, best);
                    if (beta <= alpha) break;
                }
            }
            return best;
        }
    }

    private int evaluate(String[] board, String maxPlayer, String minPlayer) {
        int[][] winLines = {
            {0, 1, 2}, {3, 4, 5}, {6, 7, 8},
            {0, 3, 6}, {1, 4, 7}, {2, 5, 8},
            {0, 4, 8}, {2, 4, 6}
        };

        for (int[] line : winLines) {
            String a = getCell(board, line[0]);
            String b = getCell(board, line[1]);
            String c = getCell(board, line[2]);

            if (!a.isEmpty() && a.equals(b) && a.equals(c)) {
                if (a.equals(maxPlayer)) return 10;
                else if (a.equals(minPlayer)) return -10;
            }
        }
        return 0;
    }

    private boolean hasEmptyCells(String[] board) {
        for (String cell : board) {
            if (cell.isEmpty()) return true;
        }
        return false;
    }

    private int getRandomMove(String[] board) {
        List<Integer> emptyCells = new ArrayList<>();
        for (int i = 0; i < 9; i++) {
            if (board[i].isEmpty()) emptyCells.add(i);
        }
        if (emptyCells.isEmpty()) return -1;
        return emptyCells.get(random.nextInt(emptyCells.size()));
    }

    private String getCell(String[] board, int index) {
        if (index >= board.length) return "";
        return board[index];
    }

    private String[] parseBoard(String boardStr) {
        String[] parts = boardStr.split(",", -1);
        String[] result = new String[9];
        for (int i = 0; i < 9; i++) {
            result[i] = (i < parts.length) ? parts[i] : "";
        }
        return result;
    }
}
