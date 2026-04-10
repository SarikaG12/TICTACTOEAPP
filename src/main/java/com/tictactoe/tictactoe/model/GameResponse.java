package com.tictactoe.tictactoe.model;

public class GameResponse {
    private String board;
    private String status; // "ONGOING", "WIN", "DRAW", "LOSS"
    private int[] winningLine;

    public String getBoard() { return board; }
    public void setBoard(String board) { this.board = board; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int[] getWinningLine() { return winningLine; }
    public void setWinningLine(int[] winningLine) { this.winningLine = winningLine; }
}
