package com.inmms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InmmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(InmmsApplication.class, args);
    }
}
