package com.tictactoe.tictactoe.model;

import java.util.List;

public class GameRequest {
    private String board; // "X,O,,X,,,O,,"
    private String playerSide; // "X" or "O"
    private String difficulty; // "Easy", "Medium", "Hard"
    private int levelNumber; // 1 to 150

    public String getBoard() { return board; }
    public void setBoard(String board) { this.board = board; }

    public String getPlayerSide() { return playerSide; }
    public void setPlayerSide(String playerSide) { this.playerSide = playerSide; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public int getLevelNumber() { return levelNumber; }
    public void setLevelNumber(int levelNumber) { this.levelNumber = levelNumber; }
}
