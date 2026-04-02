package com.openschedulr.scheduling.web;

import com.openschedulr.scheduling.dto.CreateLectureDemandRequest;
import com.openschedulr.scheduling.dto.LectureDemandResponse;
import com.openschedulr.scheduling.service.LectureDemandService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/scheduling/demands")
@RequiredArgsConstructor
public class LectureDemandController {

    private final LectureDemandService lectureDemandService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<LectureDemandResponse> list() {
        return lectureDemandService.listAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public LectureDemandResponse create(@Valid @RequestBody CreateLectureDemandRequest request, Principal principal) {
        return lectureDemandService.create(request, principal.getName());
    }

    @DeleteMapping("/{demandId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable UUID demandId, Principal principal) {
        lectureDemandService.delete(demandId, principal.getName());
    }
}
