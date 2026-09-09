from pathlib import Path

p=Path('apps/painel-ldr/src/routes/_clientarea.cliente.treinamentos.do-mamao-ao-negocio.tsx')
s=p.read_text()
imp='import { TrainingSlideExperience } from "@/components/training-slide-experience";\n'
marker='import { getDoMamaoCurriculum, PROGRAM_SUMMARY, type TrainingLocale } from "@/content/do-mamao-curriculum";\n'
if imp not in s:
    if marker not in s:
        raise SystemExit('import marker not found')
    s=s.replace(marker, marker+imp, 1)
start='      {area==="aula"&&<>\n'
end='\n      {area==="manual"&&<>'
i=s.find(start)
j=s.find(end,i)
if i<0 or j<0:
    raise SystemExit('lesson area markers not found')
replacement='''      {area==="aula"&&<TrainingSlideExperience
        key={selectedDay}
        locale={locale}
        c={c}
        currentLesson={currentLesson}
        currentState={currentState}
        selectedDay={selectedDay}
        unlockedDay={unlockedDay}
        curriculum={curriculum}
        activities={activities}
        currentComplete={currentComplete}
        dark={dark}
        card={card}
        soft={soft}
        input={input}
        updateDay={updateDay}
        persist={persist}
        goDay={goDay}
        savePending={save.isPending}
        syncLabel={syncLabel}
        isDayComplete={isDayComplete}
      />}
'''
s=s[:i]+replacement+s[j:]
p.write_text(s)
print('training slide experience wired')
