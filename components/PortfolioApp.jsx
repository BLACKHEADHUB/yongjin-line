'use client';
import { useState } from 'react';
import Gate from './Gate';
import Platform from './Platform';
import Ride from './Ride';

// 화면 흐름: 개찰구 → 승강장(첫 화면) → 탑승(노선도/목록)
export default function PortfolioApp({ data }) {
  const [stage, setStage] = useState('gate');
  const [autoplay, setAutoplay] = useState('idle');
  const [sound, setSound] = useState(false); // 소리는 기본 꺼짐

  if (stage === 'gate') return <Gate name={data.profile.name} sound={sound} onEnter={() => setStage('platform')} />;
  if (stage === 'platform') {
    return (
      <Platform
        profile={data.profile}
        projects={data.projects}
        onBoard={(auto) => {
          setAutoplay(auto ? 'run' : 'idle');
          setStage('ride');
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
