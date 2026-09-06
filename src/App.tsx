import { useEffect, useState } from 'react';
import { ChildHome } from './screens/ChildHome';
import { LessonScreen, type LessonResult } from './screens/LessonScreen';
import { LessonEnd } from './screens/LessonEnd';
import { ParentSetup } from './screens/ParentSetup';
import { ParentDashboard, ParentGate } from './screens/ParentArea';
import { getLesson, getPack } from './content';
import { useAppState } from './state';

type Screen =
  | { name: 'setup' }
  | { name: 'home' }
  | { name: 'lesson'; lessonId: string }
  | { name: 'end'; result: LessonResult }
  | { name: 'gate' }
  | { name: 'parent' };

export default function App() {
  const { data } = useAppState();
  const [screen, setScreen] = useState<Screen>(() => (data.profile ? { name: 'home' } : { name: 'setup' }));

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', data.settings.reducedMotion);
  }, [data.settings.reducedMotion]);

  if (!data.profile && screen.name !== 'setup') {
    setScreen({ name: 'setup' });
    return null;
  }

  switch (screen.name) {
    case 'setup':
      return <ParentSetup onDone={() => setScreen({ name: 'home' })} />;

    case 'lesson': {
      const lesson = getLesson(getPack(data.settings.targetLocale), screen.lessonId);
      if (!lesson) return <ChildHome onStartLesson={(id) => setScreen({ name: 'lesson', lessonId: id })} onParentArea={() => setScreen({ name: 'gate' })} />;
      return (
        <LessonScreen
          key={lesson.id}
          lesson={lesson}
          onExit={() => setScreen({ name: 'home' })}
          onFinish={(result) => setScreen({ name: 'end', result })}
        />
      );
    }

    case 'end':
      return <LessonEnd result={screen.result} onHome={() => setScreen({ name: 'home' })} />;

    case 'gate':
      return <ParentGate onPass={() => setScreen({ name: 'parent' })} onCancel={() => setScreen({ name: 'home' })} />;

    case 'parent':
      return <ParentDashboard onBack={() => setScreen({ name: 'home' })} onEditProfile={() => setScreen({ name: 'setup' })} />;

    case 'home':
    default:
      return (
        <ChildHome
          onStartLesson={(id) => setScreen({ name: 'lesson', lessonId: id })}
          onParentArea={() => setScreen({ name: 'gate' })}
        />
      );
  }
}
