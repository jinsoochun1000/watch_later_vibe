package kr.co.tkinfo.watchlater;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class WatchLaterApplication {

    public static void main(String[] args) {
        SpringApplication.run(WatchLaterApplication.class, args);
    }
}
