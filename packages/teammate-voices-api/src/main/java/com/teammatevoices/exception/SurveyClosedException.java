package com.teammatevoices.exception;

public class SurveyClosedException extends RuntimeException {

    public SurveyClosedException(String message) {
        super(message);
    }

    public SurveyClosedException(Long surveyId) {
        super("Survey " + surveyId + " is closed and no longer accepting responses");
    }
}
