package com.tictactoe.tictactoe.model;

public class PlayerState {

    private String username;
    private int highScore;
    private int totalStars;
    private int highestUnlockedLevel;

    public PlayerState() {
        this.highestUnlockedLevel = 1;
    }

    public PlayerState(String username) {
        this.username = username;
        this.highestUnlockedLevel = 1;
        this.highScore = 0;
        this.totalStars = 0;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public int getHighScore() { return highScore; }
    public void setHighScore(int highScore) { this.highScore = highScore; }

    public int getTotalStars() { return totalStars; }
    public void setTotalStars(int totalStars) { this.totalStars = totalStars; }

    public int getHighestUnlockedLevel() { return highestUnlockedLevel; }
    public void setHighestUnlockedLevel(int highestUnlockedLevel) { this.highestUnlockedLevel = highestUnlockedLevel; }
}
