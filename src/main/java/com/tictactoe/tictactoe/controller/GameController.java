package com.tictactoe.tictactoe.controller;

import com.tictactoe.tictactoe.model.GameRequest;
import com.tictactoe.tictactoe.model.GameResponse;
import com.tictactoe.tictactoe.model.HintResponse;
import com.tictactoe.tictactoe.model.PlayerState;
import com.tictactoe.tictactoe.service.AiService;
import com.tictactoe.tictactoe.service.GameService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class GameController {

    private final GameService gameService;
    private final AiService aiService;

    public GameController(GameService gameService, AiService aiService) {
        this.gameService = gameService;
        this.aiService = aiService;
    }

    @GetMapping("/player/{username}")
    public PlayerState getPlayer(@PathVariable String username) {
        return gameService.loadPlayer(username);
    }

    @PostMapping("/player")
    public PlayerState savePlayer(@RequestBody PlayerState state) {
        return gameService.savePlayer(state);
    }

    @PostMapping("/move")
    public GameResponse processMove(@RequestBody GameRequest request) {
        // First check if the human move won
        GameResponse response = gameService.checkGameState(request.getBoard(), request.getPlayerSide());
        
        if (!response.getStatus().equals("ONGOING")) {
            return response;
        }

        // If ongoing, AI makes a move
        String aiSide = request.getPlayerSide().equals("X") ? "O" : "X";
        int aiMoveIndex = aiService.determineMove(request.getBoard(), aiSide, request.getDifficulty(), request.getLevelNumber());
        
        if (aiMoveIndex != -1) {
            String[] board = parseBoard(request.getBoard());
            board[aiMoveIndex] = aiSide;
            String newBoardStr = String.join(",", board);
            
            GameResponse aiResponse = gameService.checkGameState(newBoardStr, request.getPlayerSide());
            return aiResponse;
        }

        return response; // Should not happen unless draw
    }

    @PostMapping("/hint")
    public HintResponse getHint(@RequestBody GameRequest request) {
        int hintIndex = aiService.getHint(request.getBoard(), request.getPlayerSide());
        return new HintResponse(hintIndex);
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
