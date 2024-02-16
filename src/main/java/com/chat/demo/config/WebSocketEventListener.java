package com.chat.demo.config;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.chat.demo.chat.ChatMessage;
import com.chat.demo.chat.MessageType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j

public class WebSocketEventListener {

  private final SimpMessageSendingOperations messagingTemplate;

  @SuppressWarnings("null")
  @EventListener
  public void handleWebSocketConnectListener(SessionDisconnectEvent event) {
    StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
    String username = headerAccessor.getSessionAttributes().get("username").toString();

    if (username != null) {
      log.info("User Disconnected : " + username);
      lombok.var chatMessage = ChatMessage.builder()
          .type(MessageType.LEAVE)
          .sender(username)
          .build();
      messagingTemplate.convertAndSend("/topic/public",chatMessage);
    }
  }

}
