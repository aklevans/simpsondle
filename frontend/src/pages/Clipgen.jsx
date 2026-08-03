import { useState, useRef, useEffect } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'
import '../App.css'

export default function Clipgen() {
  const [form, setForm] = useState({
    episode: "",
    episodeName: "",
    startTimestamp: "",
    middleTimestamp: "",
    endTimestamp: "",
    question: "",
    answer: ""
  });

  const [firstVideoUrl, setFirstVideoUrl] = useState(null);
  const firstVideoRef = useRef(null);

  const [secondVideoUrl, setSecondVideoUrl] = useState(null);
  const secondVideoRef = useRef(null);


  
  const [questionId, setQuestionId] = useState("");
  const updateField = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };
  const [score, setScore] = useState(0);




  const getFirst = (e) => {
    e.preventDefault();
    fetch(`http://localhost:8000/video/${form.episode}/${form.startTimestamp}/${form.middleTimestamp}`).then((response) => {
      // const index = response.headers.get("simp-quiz-index");
      // setQuestionId(index);
      return response.blob();
    }).then(blob => {
      const url = URL.createObjectURL(blob);
      setFirstVideoUrl(url);

    }).catch(error => {
      console.log(error);
    })
  }

  const getSecond = (e) => {
    e.preventDefault();
    fetch(`http://localhost:8000/video/${form.episode}/${form.startTimestamp}/${form.endTimestamp}`).then((response) => {
      // const index = response.headers.get("simp-quiz-index");
      // setQuestionId(index);
      return response.blob();
    }).then(blob => {
      const url = URL.createObjectURL(blob);
      setSecondVideoUrl(url);

    }).catch(error => {
      console.log(error);
    })
  }

  const saveToDB = (e) => {
    e.preventDefault();
    let body = {
      "episode": form.episode,
      "episodeName": form.episodeName,
      "preClipFilename": `${form.episode}-${form.startTimestamp}-${form.middleTimestamp}.mp4`,
      "postClipFilename": `${form.episode}-${form.startTimestamp}-${form.endTimestamp}.mp4`,
      "question": form.question,
      "answer": form.answer, 
      "second_clip_offset": form.middleTimestamp - form.startTimestamp
    }

    fetch(`http://localhost:8000/question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' 
      }, body:JSON.stringify(body)}).then((response) => {
      return response.json();
    }).catch(error => {
      console.log(error);
    })
  }
  


  useEffect(() => {
    if (firstVideoRef.current) {
      firstVideoRef.current.load();
      // firstVideoRef.current.play();
    }

    if (secondVideoRef.current) {
      secondVideoRef.current.load();
      // videoRef.current.play();
    }
  }, [firstVideoUrl, secondVideoUrl])

  return (
    <>
      <section id="center">
        <form onSubmit={getFirst} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Episode</label>
            <input
              type="text"
              className="form-control"
              value={form.episode}
              onChange={updateField("episode")}
              placeholder="e.g. S05E12"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Episode Name</label>
            <input
              type="text"
              className="form-control"
              value={form.episodeName}
              onChange={updateField("episodeName")}
              placeholder="e.g. Marge vs. The Monorail"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Start Timestamp</label>
            <input
              type="text"
              className="form-control"
              value={form.startTimestamp}
              onChange={updateField("startTimestamp")}
              placeholder="00:01:23.456"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Middle Timestamp</label>
            <input
              type="text"
              className="form-control"
              value={form.middleTimestamp}
              onChange={updateField("middleTimestamp")}
              placeholder="00:01:30.000"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">End Timestamp</label>
            <input
              type="text"
              className="form-control"
              value={form.endTimestamp}
              onChange={updateField("endTimestamp")}
              placeholder="00:01:30.000"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Question</label>
            <input
              type="text"
              className="form-control"
              value={form.question}
              onChange={updateField("question")}
              placeholder="Homer, there's a family of possums in here"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Answer</label>
            <input
              type="text"
              className="form-control"
              value={form.answer}
              onChange={updateField("answer")}
              placeholder="I call the big one Bitey."
            />
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              Get first clip
            </button>
            <button  onClick={getSecond} className="btn btn-primary">
              get second clip
            </button>
            <button  onClick={saveToDB} className="btn btn-primary">
              Save to db
            </button>
          </div>
        </form>

        {firstVideoUrl && (
          <video ref={firstVideoRef} controls width="600">
            <source src={firstVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        {form.episode}-{form.startTimestamp}-{form.middleTimestamp}

        {secondVideoUrl && (
          <video ref={secondVideoRef} controls width="600">
            <source src={secondVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        {form.episode}-{form.startTimestamp}-{form.endTimestamp}
      </section>


    </>
  )
}
