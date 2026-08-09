import { useState, useRef, useEffect, useCallback } from 'react'
import '../App.css'
import './Home.css'
import { useSearchParams } from "react-router-dom";

const backendURL = import.meta.env.VITE_BACKEND_URL;
const r2URL = import.meta.env.VITE_R2_URL;

export default function Home() {
  const videoRef = useRef(null);
  const [question, setQuestion] = useState(null);
  const [response, setResponse] = useState(null);
  const [answer, setAnswer] = useState("");
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [episodeAnswer, setEpisodeAnswer] = useState("");
  const [episodeResponse, setEpisodeResponse] = useState(null);
  const [isSubmittingEpisode, setIsSubmittingEpisode] = useState(false);
  const [episodeError, setEpisodeError] = useState(null);


  const [searchParams] = useSearchParams();
  const questionID = searchParams.get("questionID");

  const fetchQuestion = useCallback(() => {
    setIsLoadingQuestion(true);
    setError(null);
    setResponse(null);
    setAnswer("");
    setEpisodeAnswer("");
    setEpisodeResponse(null);
    setEpisodeError(null);

    let url=`${backendURL}/quiz`;

    if(questionID){
      const params = new URLSearchParams({
        questionID: questionID,
      });
      url = `${url}?${params}`
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setQuestion(data);
      })
      .catch((err) => {
        console.log(err);
        setError("Couldn't load a clip. Please try again.");
      })
      .finally(() => setIsLoadingQuestion(false));
  }, []);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();

      if (response) {
        videoRef.current.currentTime = response.offset / 1000;
      }

      videoRef.current.play().catch(() => {});
    }
  }, [question, response])

  const handleGuess = (e) => {
    e.preventDefault();
    if (!question || !answer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    const body = {
      answer,
      questionID: question.questionID
    };

    fetch(`${backendURL}/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }, body: JSON.stringify(body)
    }).then((res) => {
      return res.json();
    }).then(data => {
      setResponse(data);
    }).catch(error => {
      console.log(error);
      setError("Couldn't check your answer. Please try again.");
    }).finally(() => {
      setIsSubmitting(false);
    });
  }

  const handleEpisodeGuess = (e) => {
    e.preventDefault();
    if (!question || !episodeAnswer.trim() || isSubmittingEpisode) return;

    setIsSubmittingEpisode(true);
    setEpisodeError(null);
    const body = {
      episodeName: episodeAnswer,
      questionID: question.questionID
    };

    fetch(`${backendURL}/quiz/episode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }, body: JSON.stringify(body)
    }).then((res) => {
      return res.json();
    }).then(data => {
      console.log(data);
      setEpisodeResponse(data);
    }).catch(error => {
      console.log(error);
      setEpisodeError("Couldn't check your answer. Please try again.");
    }).finally(() => {
      setIsSubmittingEpisode(false);
    });
  }

  const videoSrc = question
    ? `${r2URL}/${response ? response.video_url : question.video_url}`
    : null;

  return (
    <section id="center" className="quiz-page">
      
      <div className="quiz-card">
        <h1>CI/CD works!!</h1>
        {isLoadingQuestion && (
          <div className="quiz-loading">
            <div className="quiz-spinner" />
            <p>Loading a clip…</p>
          </div>
        )}

        {!isLoadingQuestion && !question && error && (
          <div className="quiz-error">
            <p>{error}</p>
            <button className="quiz-btn quiz-btn-secondary" onClick={fetchQuestion}>
              Try again
            </button>
          </div>
        )}

        {question && (
          <>
            <div className="quiz-video-wrap">
              <img src="/images/simpson_tv.png"/>

              <video ref={videoRef} controls playsinline className="quiz-video">
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>


            {!response && (
              <form className="quiz-form" onSubmit={handleGuess}>
                <label className="quiz-label" htmlFor="guess-input">
                  What's the next line?
                </label>
                <input
                  id="guess-input"
                  type="text"
                  className="quiz-input"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your guess…"
                  autoComplete="off"
                  disabled={isSubmitting}
                />
                {error && <p className="quiz-inline-error">{error}</p>}
                <button
                  type="submit"
                  className="quiz-btn quiz-btn-primary"
                  disabled={isSubmitting || !answer.trim()}
                >
                  {isSubmitting ? "Checking…" : "Guess"}
                </button>
              </form>
            )}

            {response && (
              <div className="quiz-result">
                <div className={`quiz-result-banner ${response.isCorrect ? 'is-correct' : 'is-incorrect'}`}>
                  {response.isCorrect ? "Correct!" : "Not quite"}
                </div>
                {!response.isCorrect && (
                  <p className="quiz-answer-reveal white-simp-text">
                    The line was: <strong>"{response.answer}"</strong>
                  </p>
                )}

                {!episodeResponse && (
                  <form className="quiz-form" onSubmit={handleEpisodeGuess}>
                    <label className="quiz-label" htmlFor="episode-guess-input">
                      Bonus: which episode is this from?
                    </label>
                    <input
                      id="episode-guess-input"
                      type="text"
                      className="quiz-input"
                      value={episodeAnswer}
                      onChange={(e) => setEpisodeAnswer(e.target.value)}
                      placeholder="Type the episode name…"
                      autoComplete="off"
                      disabled={isSubmittingEpisode}
                    />
                    {episodeError && <p className="quiz-inline-error">{episodeError}</p>}
                    <div className="quiz-form-actions">
                      <button
                        type="submit"
                        className="quiz-btn quiz-btn-primary"
                        disabled={isSubmittingEpisode || !episodeAnswer.trim()}
                      >
                        {isSubmittingEpisode ? "Checking…" : "Guess Episode"}
                      </button>
                      <button
                        type="button"
                        className="quiz-btn quiz-btn-secondary"
                        onClick={fetchQuestion}
                        disabled={isSubmittingEpisode}
                      >
                        Skip
                      </button>
                    </div>
                  </form>
                )}

                {episodeResponse && (
                  <>
                    <div className={`quiz-result-banner white-simp-text ${episodeResponse.isCorrect ? 'is-correct' : 'is-incorrect'}`}>
                      {episodeResponse.isCorrect ? "Correct episode!" : "Not quite"}
                    </div>
                    {!episodeResponse.isCorrect && (
                      <p className="quiz-answer-reveal white-simp-text">
                        The episode was: <strong>"{episodeResponse.answer}"</strong>
                      </p>
                    )}
                    <button className="quiz-btn quiz-btn-primary" onClick={fetchQuestion}>
                      Next Clip
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
