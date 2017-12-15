export default `
.hidden {
	display: none;
}
#gesundheitslogin iframe,
#gesundheitslogin form,
#gesundheitslogin input,
#gesundheitslogin button {
	margin: 0;
	padding: 0;
	border: 0;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
}

#gesundheitslogin iframe {
  width: 100%;
  height: 4rem;
}

#gesundheitslogin iframe input,
#gesundheitslogin button,
#gesundheitslogin input {
  overflow: visible;
}

#gesundheitslogin label {
  color: #909499;
  line-height: 2rem;
}

#gesundheitslogin .row {
  padding: 0.3rem 0;
}

#gesundheitslogin input:not([type]),
#gesundheitslogin input:not(.browser-default) {
  color: #999999;
  background-color: white;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  outline: none;
  height: 3rem;
  width: 88% !important;
  font-size: 1rem;
  padding: 0 5%;
  margin: 0 5px 5px 0px !important;
  -moz-box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.266666666666667);
  -webkit-box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.266666666666667);
  box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.266666666666667);
  -webkit-box-sizing: content-box !important;
          box-sizing: content-box !important;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
}

#gesundheitslogin input:not([type]):focus:not([readonly]),
#gesundheitslogin input:not(.browser-default):focus:not([readonly]) {
  border-bottom: 2px solid #3E8FF5;
  -moz-box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.266666666666667);
  -webkit-box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.266666666666667);
  box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.266666666666667);
}

#gesundheitslogin input:not([type]):focus:not([readonly]) + label,
#gesundheitslogin input:not(.browser-default):focus:not([readonly]) + label {
  color: #26a69a;
}

#gesundheitslogin input:not(.browser-default) + label:after {
  display: block;
  content: "";
  position: absolute;
  top: 100%;
  left: 0;
  opacity: 0;
  -webkit-transition: .2s opacity ease-out, .2s color ease-out;
  transition: .2s opacity ease-out, .2s color ease-out;
}

#gesundheitslogin button {
  width: 98%;
  height: 3rem;
  background: inherit;
  background-color: #3E8FF5;
  color: #FFFFFF;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  -moz-box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.266666666666667);
  -webkit-box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.266666666666667);
  box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.266666666666667);
}

#gesundheitslogin button:hover {
  background-color: #2576DC;
}

#gesundheitslogin button:disabled {
  background-color: grey;
  -moz-box-shadow: none;
  -webkit-box-shadow: none;
  box-shadow: none;
}
`;
