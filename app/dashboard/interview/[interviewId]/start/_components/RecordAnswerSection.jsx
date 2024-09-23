"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Mic,  StopCircleIcon } from "lucide-react";
import { chatSession } from "@/utils/GeminiAIModal";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import moment from 'moment';
import { db } from "@/utils/db";
// import { userAnswer } from "@/utils/schema";



function RecordAnswerSection({mockInterviewQuestion,activeQuestionIndex,interviewData}) {
  const [userAnswer, setUserAnswer] = useState('');
  const {user}=useUser();
  const [loading,setLoading]=useState(false);
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });
  

  useEffect(() => {
    results.map((result) => {
      setUserAnswer((prevAns) => prevAns + result?.transcript);
    });
  }, [results])

  useEffect(() =>{
    if(!isRecording&&userAnswer.length>10){
      UpdateUserAnswer();
    }
    
 
  },[userAnswer])



  const StartStopRecording=async()=>{
    if(isRecording){
      
      stopSpeechToText()
      
    }
    else{
      startSpeechToText();
    }
  }


  const UpdateUserAnswer=async()=>{
    console.log(userAnswer);
    setLoading(true)
    const feedbackPrompt="Question:"+mockInterviewQuestion[activeQuestionIndex]?.question+
      ",User Answer:"+userAnswer+",Depends on question and user answer for given interview question"+
      "Please give us rating for answer and feedback as area of improvement if any "+"in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";

      const result=await chatSession.sendMessage(feedbackPrompt);

      const mockJsonResp=(result.response.text()).replace('```json','').replace('```','');
      console.log(mockJsonResp);
      const JsonFeedbackRes=JSON .parse(mockJsonResp);

      if (interviewData.mockId)
      {
        console.log("[INTERVIEWDATARECEIVED]", interviewData?.mockId);
        const resp=await db.insert(userAnswer).userAnswer({
        mockIdRef:interviewData?.mockId,
        question:mockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns:mockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns:userAnswer,
        feedback:JsonFeedbackRes?.feedback,
        rating:JsonFeedbackRes?.rating,
        userEmail:user?.primaryEmailAddress?.emailAddress,
        createdAt:moment().format('DD-MM-yyyy')

      })
      if(resp){
        toast('User Answer recorded successfully')
      }}
      setUserAnswer('');
      setLoading(false);



  }


  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col mt-20 justify-center items-center  bg-black rounded-lg p-5">
        <Image
          src={"/webcam.png"}
          width={250}
          height={250}
          className="absolute h-50 w-50"
        />
        <Webcam
          mirrored={true}
          style={{
            height: 300,
            width: "100%",
            zIndex: 10,
          }}
        />
      </div>
      <Button
      disabled={loading}
        variant="outline"
        className="my-10"
        onClick={StartStopRecording}
      >
        {isRecording ? (
          <h2 className='text-red-600 flex gap-2 items-center'>
            <StopCircleIcon />Stop Recording
          </h2>
        ) : (
          <h2 className='text-primary flex gap-2 items-center'><Mic/>Record Answer</h2>
        )}
      </Button>

      
    </div>

)
};



export default RecordAnswerSection;