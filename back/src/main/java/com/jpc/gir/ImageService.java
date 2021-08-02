package com.jpc.gir;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ImageService {
    @Autowired RepoImage repoImage;

    @Transactional
    public Response save(List<Image> list) {
        try {
            repoImage.truncate();
            repoImage.saveAll(list);
            return new Response(true, "Saved successfully");
        } catch (Exception e) {
            return new Response(true, "Runtime Error");
        }
    }

    public List<Image> getImages() {
        return repoImage.findAll();
    }
}
