'use client';
import { useState } from 'react';
import Gate from './Gate';
import Platform from './Platform';
import Ride from './Ride';

// 화면 흐름: 포트폴리오(첫 화면) → "성장 노선도 보기" → 개찰구 → 노선도/목록
export default function PortfolioApp({ data }) {
  const [stage, setStage] = useState('platform');
  const [pendingAuto, setPendingAuto] = useState(false);
  const [autoplay, setAutoplay] = useState('idle');
  const [sound, setSound] = useState(false); // 소리는 기본 꺼짐

  if (stage === 'gate') {
    return (
      <Gate
        name={data.profile.name}
        sound={sound}
        onEnter={() => {
          setAutoplay(pendingAuto ? 'run' : 'idle');
          setStage('ride');
        }}
      />
    );
  }
  if (stage === 'platform') {
    return (
      <Platform
        profile={data.profile}
        projects={data.projects}
        stations={data.stations}
        onBoard={(auto) => {
          setPendingAuto(auto);
          setStage('gate');
        }}
      />
    );
  }
  return (
    <Ride
      data={data}
      sound={sound}
      setSound={setSound}
      autoplay={autoplay}
      setAutoplay={setAutoplay}
      onPlatform={() => {
        setAutoplay('idle');
        setStage('platform');
      }}
    />
  );
}
