package com.smartcourier.claims.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_NAME = "claim.status.queue";
    public static final String EXCHANGE_NAME = "claim.exchange";
    public static final String ROUTING_KEY = "claim.routing.key";

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean("claimStatusQueue")
    public Queue claimStatusQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean("claimExchange")
    public DirectExchange claimExchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding claimBinding(
            @Qualifier("claimStatusQueue") Queue queue,
            @Qualifier("claimExchange") DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }
}
