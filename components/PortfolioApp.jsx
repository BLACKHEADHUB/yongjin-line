'use client';
import { useState } from 'react';
import Gate from './Gate';
import Platform from './Platform';
import Ride from './Ride';

// 화면 흐름: 첫 화면(교통카드) → 개찰구(카드 찍기) → 노선도.
export default function PortfolioApp({ data, guestbook }) {
  const [stage, setStage] = useState('platform');
  const [sound, setSound] = useState(true);

  if (stage === 'gate') {
    return <Gate profile={data.profile} sound={sound} setSound={setSound} onEnter={() => setStage('ride')} />;
  }
  if (stage === 'ride') return <Ride data={data} guestbook={guestbook} sound={sound} setSound={setSound} onPlatform={() => setStage('platform')} />;
  return <Platform profile={data.profile} projects={data.projects} stations={data.stations} onBoard={() => setStage('gate')} />;
}
