package com.kh.project.domain.elasticsearch;

import com.kh.project.domain.entity.Youtube;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class YoutubeSearchSVC {
  final private YoutubeSearchDAO youtubeSearchDAO;

  public List<Youtube> search(String keyword, int from, int size){
    return youtubeSearchDAO.search(keyword, from, size);
  }
}
