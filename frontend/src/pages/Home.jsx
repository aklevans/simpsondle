import { useState, useRef, useEffect, createRef  } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'
import '../App.css'

export default function Home() {
  const videoRef = createRef();
  const [question, setQuestion] = useState(null);
  const [response, setResponse] = useState(null);
  const [form, setForm] = useState({
    answer: "",
  });

  const updateField = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();

      if(response){
        videoRef.current.currentTime = response.offset / 1000;
      }

      videoRef.current.play();
    }
  }, [question, response])

  
  useEffect(() => {
    fetch("http://localhost:8000/quiz").then((response) => {
      return response.json()
    }).then(data => {
      setQuestion(data);
    })
  }, [])

  const handleGuess = () => {
    if(question){
      console.log(question)
      let body = {
        "answer": form.answer,
        "questionID": question.questionID
      }
      fetch(`http://localhost:8000/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' 
        }, body: JSON.stringify(body)}).then((response) => {
          return response.json();
        }).then(data => {
          console.log(data);
          setResponse(data)
        }).catch(error => {
          console.log(error);
        });
    }

  }



  return (
    <>
      <section id="center">
          {question && (
          <video ref={videoRef} controls width="600">
            <source src={`clips/${response ? response.video_url : question.video_url}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          )}
          {question && question?.isCorrect && (
              <div>Correct</div>
          )}

          {!response &&
            (<div>
              <div className="col-md-4">
              <label className="form-label">Next Line?</label>
              <input
                type="text"
                className="form-control"
                value={form.answer}
                onChange={updateField("answer")}
              />
             </div>
              <button  onClick={() => handleGuess()} className="btn btn-primary">
                  Guess
              </button>
            </div>)
          }
          


      </section>
    </>
  );
}

