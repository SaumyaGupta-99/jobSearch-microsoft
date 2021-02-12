function signupcandidate(e) {
  e.preventDefault();
  var data = new FormData(this);
  $.ajax({
    url: "http://localhost:3000/api/candidate/signup",
    data: data,
    cache: false,
    contentType: false,
    processData: false,
    type: "POST",
    success: function (response) {
      console.log(response);
      localStorage.setItem("token", response["token"]);
      window.location.href = "signin.html";
    },
    error: function (e) {
      $("#result").text(e.responseText);
      console.log("ERROR : ", e);
      $("#btnSubmit").prop("disabled", false);
    },
  });
}
function signuprecruiter(e) {
  e.preventDefault();
  const data = $("form").serialize();
  $.ajax({
    type: "POST",
    url: "http://localhost:3000/api/recruiter/signup",
    data,
    success: (data) => {
      localStorage.setItem("token", data.token);
      window.location.href = "signin.html";
    },
  });
}
function signin(e) {
  e.preventDefault();
  const data = $("form").serialize();
  $.ajax({
    type: "POST",
    url: "http://localhost:3000/api/login?role=" + $(".role").val(),
    data,
    success: (data) => {
      localStorage.setItem("token", data.token);
      if ($(".role").val() == "candidate")
        window.location.href = "dashboard_candidate.html";
      else window.location.href = "dashboard_recruiter.html";
    },
    error: () => {
      $("#login-error")[0].classList.remove("d-none");
    },
  });
}
function postjob(e) {
  e.preventDefault();
  const data = $("form").serialize();
  $.ajax({
    type: "POST",
    url: "http://localhost:3000/api/job",
    headers: { authorization: "Bearer " + localStorage.getItem("token") },
    data,
    success: (data) => {
      window.location.href = "dashboard_recruiter.html";
    },
  });
}
