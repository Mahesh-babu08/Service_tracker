package com.enterprise.service_tracker;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = TicketAnalyzerApplication.class)
@ActiveProfiles("test")
class TicketAnalyzerApplicationTests {

	@Test
	void contextLoads() {
	}

}
