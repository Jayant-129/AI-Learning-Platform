package com.learnerplatform.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MLPredictionResponse {
    private Long learnerId;
    private String learnerName;
    private Double probability;
    private Boolean placeable;
    private List<String> topFactors;
}
