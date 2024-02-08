"use client";
import React, { useState } from "react";
import { nationalities, baranggays } from "@/config/local";
import { doc, setDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase";

export function CertificateFormView({ submitFunction, certificate }) {
  
  let date = certificate.data().DateIssued.toDate();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let finDate = year + "-" + month + "-" + day;

  let currentNo = certificate.data().No;
  let currentOrNo = certificate.data().OrNo;
  let currentDate = certificate.data().DateIssued;
  let currentName = certificate.data().Name;
  let currentOccupation = certificate.data().Occupation;
  let currentAge = certificate.data().Age;
  let currentSex = certificate.data().Sex;
  let currentNationality = certificate.data().Nationality;
  let currentPlaceOfWork = certificate.data().PlaceOfWork;

  const [no, setNo] = useState(certificate.data().No);
  const [orNo, setOrNo] = useState(certificate.data().OrNo);
  const [dateIssued, setdateIssued] = useState(finDate);
  const [namePerson, setNamePerson] = useState(certificate.data().Name);
  const [occupation, setOccupation] = useState(certificate.data().No);
  const [age, setAge] = useState(certificate.data().Age);
  const [sex, setSex] = useState(certificate.data().Sex);
  const [nationality, setNationality] = useState(
    certificate.data().Nationality
  );
  const [placeOfWork, setPlaceOfWork] = useState(
    certificate.data().PlaceOfWork
  );

  const [editMode, setEditMode] = useState(false);

  function DateInput() {
    return (
      <input
        disabled={!editMode}
        onChange={(e) => {
          setdateIssued(e.target.value);
        }}
        defaultValue={finDate}
        type="date"
        className="inDate border"
      />
    );
  }

  // async function addToDatabase(e) {
  //   e.preventDefault()

  function edit(e, isSuccess) {
    e.preventDefault();
    setEditMode(!editMode);
    if (editMode && !isSuccess) {
      //set back, cancel edit

      let datex = currentDate.toDate();
      let dayx = datex.getDate();
      let monthx = datex.getMonth() + 1;
      let yearx = datex.getFullYear();
      let finDatex = yearx + "-" + monthx + "-" + dayx;

      document.querySelector(".inNo").value = currentNo;
      document.querySelector(".inOrNo").value = currentOrNo;
      document.querySelector(".inDate").value = finDatex;
      document.querySelector(".inName").value = currentName;
      document.querySelector(".inOccupation").value = currentOccupation;
      document.querySelector(".inAge").value = currentAge;
      document.querySelector(".inSex").value = currentSex;
      document.querySelector(".inNationality").value = currentNationality;
      document.querySelector(".inPlaceOfWork").value = currentPlaceOfWork;
    }
  }

  async function submit() {
    let dateissued = new Date(dateIssued + "T00:00+08:00");
    if (
      no >= 0 &&
      orNo >= 0 &&
      age >= 0 &&
      namePerson.trim() != "" &&
      occupation.trim() != ""
    ) {
      await setDoc(
        doc(db, "certificates", certificate.id),
        {
          No: no,
          OrNo: orNo,
          DateIssued: Timestamp.fromDate(dateissued),
          Name: namePerson,
          Occupation: occupation,
          Age: age,
          Sex: sex,
          Nationality: nationality,
          PlaceOfWork: placeOfWork,
        },
        { merge: true }
      );

      // todo: success modal
      alert("success");

      currentNo = no
      currentOrNo = orNo
      currentDate = dateIssued
      currentName = namePerson
      currentOccupation = occupation
      currentAge = age
      currentSex = sex
      currentNationality = nationality
      currentPlaceOfWork = placeOfWork

      try {
        submitFunction();
      } catch (error) {
        console.error(error);
      }
    } else {
      // todo: fail
      alert("fail");
    }
  }

  return (
    <div>
      <form>
        viewing certificate
        <div>
          no.
          <input
            disabled={!editMode}
            onChange={(e) => {
              setNo(e.target.value);
            }}
            type="number"
            className="inNo border"
            defaultValue={certificate.data().No}
            key={certificate.data().No}
          />
        </div>
        <div>
          OR no.
          <input
            disabled={!editMode}
            onChange={(e) => {
              setOrNo(e.target.value);
            }}
            type="number"
            className="inOrNo border"
            defaultValue={certificate.data().OrNo}
            key={certificate.data().OrNo}
          />
        </div>
        <div>
          Date Issued
          {DateInput()}
        </div>
        <div>
          Name
          <input
            disabled={!editMode}
            onChange={(e) => {
              setNamePerson(e.target.value);
            }}
            type="text"
            className="inName border"
            defaultValue={certificate.data().Name}
            key={certificate.data().Name}
          />
        </div>
        <div>
          Occupation
          <input
            disabled={!editMode}
            onChange={(e) => {
              setOccupation(e.target.value);
            }}
            type="text"
            className="inOccupation border"
            defaultValue={certificate.data().Occupation}
            key={certificate.data().Occupation}
          />
        </div>
        <div>
          Age
          <input
            disabled={!editMode}
            onChange={(e) => {
              setAge(e.target.value);
            }}
            type="number"
            className="inAge border"
            defaultValue={certificate.data().Age}
            key={certificate.data().Age}
          />
        </div>
        <div>
          Sex
          <select
            className="inSex"
            disabled={!editMode}
            defaultValue={certificate.data().Sex}
            key={certificate.data().Sex}
            onChange={(e) => {
              setSex(e.target.value);
            }}
            name=""
            id=""
          >
            <option key="1" value="male">
              Male
            </option>
            <option key="2" value="female">
              Female
            </option>
          </select>
        </div>
        <div>
          Nationality
          <select
            className="inNationality"
            disabled={!editMode}
            onChange={(e) => {
              setNationality(e.target.value);
            }}
            name=""
            id=""
            defaultValue={certificate.data().Nationality}
            key={certificate.data().Nationality}
          >
            {nationalities.map((x, index) => {
              return (
                <option key={index} value={x}>
                  {x}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          Place of Work
          <select
            className="inPlaceOfWork"
            disabled={!editMode}
            onChange={(e) => {
              setPlaceOfWork(e.target.value);
            }}
            name=""
            id=""
            defaultValue={certificate.data().PlaceOfWork}
            key={certificate.data().PlaceOfWork}
          >
            {baranggays.map((x, index) => {
              return (
                <option key={index} value={x}>
                  {x}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <button onClick={edit} className="border">
            edit
          </button>
        </div>
        <div>
          <button
            hidden={!editMode}
            onClick={(e) => {
              e.preventDefault();
              submit(e);
            }}
            type="submit"
            className="border"
          >
            submit
          </button>
        </div>
        {!editMode ? "" : "now Editing"}
      </form>
    </div>
  );
}
