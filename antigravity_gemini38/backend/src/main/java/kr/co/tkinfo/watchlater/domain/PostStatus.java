package kr.co.tkinfo.watchlater.domain;

import lombok.Getter;

@Getter
public enum PostStatus {
    NEW("신규"),
    COMPLETED("완료");

    private final String description;

    PostStatus(String description) {
        this.description = description;
    }
}
