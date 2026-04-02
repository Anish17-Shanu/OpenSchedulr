package com.openschedulr.course.web;

import com.openschedulr.common.dto.PageResponse;
import com.openschedulr.course.dto.CreateCourseRequest;
import com.openschedulr.course.dto.CourseResponse;
import com.openschedulr.course.dto.UpdateCourseRequest;
import com.openschedulr.course.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import java.security.Principal;
import java.util.UUID;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public PageResponse<CourseResponse> list(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "10") int size) {
        return courseService.list(page, size);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public CourseResponse create(@Valid @RequestBody CreateCourseRequest request, Principal principal) {
        return courseService.create(request, principal.getName());
    }

    @PutMapping("/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public CourseResponse update(@org.springframework.web.bind.annotation.PathVariable UUID courseId,
                                 @Valid @RequestBody UpdateCourseRequest request,
                                 Principal principal) {
        return courseService.update(courseId, request, principal.getName());
    }

    @DeleteMapping("/{courseId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@org.springframework.web.bind.annotation.PathVariable UUID courseId, Principal principal) {
        courseService.delete(courseId, principal.getName());
    }
}
