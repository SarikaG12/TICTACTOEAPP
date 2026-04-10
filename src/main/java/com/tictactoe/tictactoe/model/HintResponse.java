package com.tictactoe.tictactoe.model;

public class HintResponse {
    private int suggestedIndex;

    public HintResponse(int suggestedIndex) {
        this.suggestedIndex = suggestedIndex;
    }

    public int getSuggestedIndex() { return suggestedIndex; }
    public void setSuggestedIndex(int suggestedIndex) { this.suggestedIndex = suggestedIndex; }
}
