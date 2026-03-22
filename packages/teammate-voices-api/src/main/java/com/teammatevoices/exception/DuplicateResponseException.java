package com.teammatevoices.exception;

public class DuplicateResponseException extends RuntimeException {

    public DuplicateResponseException(String message) {
        super(message);
    }

    public DuplicateResponseException(String participantId, Long surveyId) {
        super("Participant " + participantId + " has already responded to survey " + surveyId);
    }
}
