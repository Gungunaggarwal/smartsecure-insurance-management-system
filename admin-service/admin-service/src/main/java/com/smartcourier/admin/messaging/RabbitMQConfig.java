package com.smartcourier.admin.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "spring.rabbitmq.enabled", havingValue = "true", matchIfMissing = true)
public class RabbitMQConfig {

    public static final String QUEUE_NAME = "claim.status.queue";
    public static final String EXCHANGE_NAME = "claim.exchange";
    public static final String ROUTING_KEY = "claim.routing.key";

    @Bean
    public Queue claimStatusQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public DirectExchange claimExchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding binding(Queue queue, DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // 🔥 IMPORTANT ADD THIS
    @Bean
    public org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate(
            org.springframework.amqp.rabbit.connection.ConnectionFactory connectionFactory) {

        org.springframework.amqp.rabbit.core.RabbitTemplate template =
                new org.springframework.amqp.rabbit.core.RabbitTemplate(connectionFactory);

        template.setMessageConverter(messageConverter());

        return template;
    }
}