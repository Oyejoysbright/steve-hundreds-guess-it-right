package com.jpc.gir;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@CrossOrigin("*")
@RestController
@RequestMapping(path = "/gir")
public class ConImages {
    @Autowired ImageService service;

    @GetMapping(value="/get")
    public List<Image> getImages() {
        return service.getImages();
    }

    @PostMapping(value="/save")
    public Response save(@RequestBody List<Image> list) {
        return service.save(list);
    }
    
    
}
