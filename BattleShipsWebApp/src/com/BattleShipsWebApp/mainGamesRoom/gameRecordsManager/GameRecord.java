package com.BattleShipsWebApp.mainGamesRoom.gameRecordsManager;

import BattleShipsEngine.engine.Game;
import BattleShipsEngine.engine.Player;
import com.BattleShipsWebApp.exceptions.GameRecordSizeException;
import com.BattleShipsWebApp.exceptions.RecordAlreadyExistsException;
import com.BattleShipsWebApp.exceptions.RecordDoesNotExistsException;
import com.BattleShipsWebApp.registration.users.Participant;
import com.BattleShipsWebApp.registration.users.User;
import com.BattleShipsWebApp.registration.users.Watcher;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class GameRecord {
    private final String gameName;
    private final User creator;
    private GameStatus gameStatus = GameStatus.EMPTY;
    private final Set<Participant> participants;
    private final Set<Watcher> watchers;
    private final Game game;
    private final int boardSize;

    public GameRecord(String gameName, String creatorName, Game game) {
        this.gameName = gameName;
        this.game = game;
        this.creator = new User(creatorName); // creator is regarded as player one
        this.participants = new HashSet<>();
        participants.add(new Participant(creatorName, Player.Type.PLAYER_ONE));
        this.watchers = new HashSet<>();
        this.boardSize = game.getBoardSize();
    }

    public String getGameName() {
        return gameName;
    }

    public User getCreator() {
        return creator;
    }

    public Set<User> getParticipants() {
        return Collections.unmodifiableSet(participants);
    }

    public Set<User> getWatchers() {
        return Collections.unmodifiableSet(watchers);
    }

    public void addParticipant(User user) throws RecordAlreadyExistsException, GameRecordSizeException {
        if (participants.contains(new Participant(user.getUserName(), null))) {
            throw new RecordAlreadyExistsException("User is already a partcipant! " + user.getUserName());
        }

        Player.Type playerType = getJoinedPlayerTypeFromStatus(gameStatus);
        gameStatus = getGameStatusFormJoin(gameStatus);

        participants.add(new Participant(user.getUserName(), playerType));
    }

    public void addWatcher(User user) throws RecordAlreadyExistsException, GameRecordSizeException {
        if (watchers.contains(new Watcher(user.getUserName()))) {
            throw new RecordAlreadyExistsException("User is already a watcher! " + user.getUserName());
        }

        watchers.add(new Watcher(user.getUserName()));
    }

    private Player.Type getJoinedPlayerTypeFromStatus(GameStatus currentStatus) throws GameRecordSizeException {
        Player.Type resultStatus = null;
        switch (currentStatus) {
            case EMPTY:
                resultStatus = Player.Type.PLAYER_ONE;
                break;
            case ONE_PLAYER:
                resultStatus = Player.Type.PLAYER_TWO;
                break;
            case FULL:
                throw new GameRecordSizeException("Game is already full");
        }
        return resultStatus;
    }

    private GameStatus getGameStatusFormJoin(GameStatus gameStatus) throws GameRecordSizeException {
        GameStatus resultStatus = null;
        switch (gameStatus) {
            case EMPTY:
                resultStatus = GameStatus.ONE_PLAYER;
                break;
            case ONE_PLAYER:
                resultStatus = GameStatus.FULL;
                break;
            case FULL:
                throw new GameRecordSizeException("Game is already full");
        }
        return resultStatus;
    }

    public void removeParticipant(User user) throws RecordDoesNotExistsException {
        if (!participants.contains(new Participant(user.getUserName(), null))) {
            throw new RecordDoesNotExistsException("User is not a participant! " + user.getUserName());
        }

        participants.remove(new Participant(user.getUserName(), null));
    }

    public void removeWatcher(User user) throws RecordDoesNotExistsException {
        if (!watchers.contains(new Watcher(user.getUserName()))) {
            throw new RecordDoesNotExistsException("User is not a watcher! " + user.getUserName());
        }

        watchers.remove(new Watcher(user.getUserName()));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GameRecord)) return false;

        GameRecord that = (GameRecord) o;

        return gameName.equals(that.gameName);
    }

    @Override
    public int hashCode() {
        return gameName.hashCode();
    }

    public void setGameStatus(GameStatus gameStatus) {
        this.gameStatus = gameStatus;
    }

    public GameStatus getGameStatus() {
        return gameStatus;
    }
}
