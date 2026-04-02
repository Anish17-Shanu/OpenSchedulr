package com.openschedulr.common.dto;

import java.util.List;

public record PageResponse<T>(
        List<T> content,
        long totalElements
) {
}
