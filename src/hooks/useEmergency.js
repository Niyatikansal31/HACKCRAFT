import { useMemo, useState } from 'react';
import { emergencyConditions } from '../utils/constants';

const firstAidTipsMap = {
  'Chest Pain': ['Help the person sit upright and stay calm.', 'Loosen tight clothing and monitor breathing.', 'Call emergency help immediately if pain is severe or spreading.'],
  'Difficulty Breathing': ['Move the person to fresh air and sit them up.', 'Loosen clothing around the chest and neck.', 'Call emergency help if breathing worsens or lips turn blue.'],
  Seizure: ['Keep the person on their side and clear nearby objects.', 'Do not put anything in their mouth.', 'Call emergency help if it lasts more than 5 minutes.'],
  Bleeding: ['Apply firm pressure with a clean cloth.', 'Elevate the injured area if possible.', 'Seek urgent help if bleeding does not stop.'],
  Unconscious: ['Check breathing and pulse immediately.', 'Place the person on their side if breathing.', 'Call emergency services now.'],
  Stroke: ['Note the time symptoms started.', 'Keep the person seated with head supported.', 'Call emergency help immediately.'],
  Poisoning: ['Move away from the source if safe.', 'Do not force vomiting unless a professional instructs you.', 'Call poison or emergency services right away.'],
  Burn: ['Cool the burn under running water for 20 minutes.', 'Remove tight items near the burn.', 'Do not apply ice, butter, or toothpaste.'],
  Choking: ['Encourage coughing if they can breathe.', 'Give back blows if airway is blocked.', 'Start abdominal thrusts if trained and necessary.'],
  Other: ['Stay calm and assess immediate danger.', 'Call emergency help if symptoms are severe.', 'Keep the person comfortable and monitored.'],
};

export function useEmergency() {
  const [selectedCondition, setSelectedCondition] = useState(emergencyConditions[0]);

  return useMemo(
    () => ({
      emergencyConditions,
      selectedCondition,
      setSelectedCondition,
      firstAidTips: firstAidTipsMap[selectedCondition] || firstAidTipsMap.Other,
    }),
    [selectedCondition],
  );
}
