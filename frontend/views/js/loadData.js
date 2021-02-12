function showcandidates(id){
    $.ajax({
      url: "http://localhost:3000/api/job/"+id+"/candidates",
      method: "GET",
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      success: function (obj) {
        let i = 0;
        while (i < obj.length) {
          $(".companies").append(
            $("<div>", { type: "div", class: "company-list" })
          );
          $(".company-list")
            .last()
            .append($("<div>", { type: "div", class: "row" }));
          $(".row")
            .last()
            .append(
              $("<div>", { type: "div", class: "maincol col-md-10 col-sm-10" })
            );
          $(".maincol")
            .last()
            .append($("<div>", { type: "div", class: "company-content "+i}));
          var title = $("<h3>", { type: "h3", text: obj[i]['candidate']["name"] });
          var matched = $("<span>", {
            type: "span",
            text: "Matched Skills:"+obj[i]["matched"],
            class: "internship",
          });
          title.append(matched);
          $(".company-content").last().append(title);
          var details = $("<p>", { type: "p" });
          var emailid = $("<span>", {
            type: "span",
            text: "Email Id: " + obj[i]['candidate']["email"],
            class: "location",
          });
          var phoneno = $("<span>", {
            type: "span",
            text: "Phone Number: " + obj[i]['candidate']["phone"],
            class: "package",
          });
          details.append(emailid);
          details.append(phoneno);
          $(".company-content").last().append(details);
          $(".company-content").last().append(details);
          var btnskill = $("<button>", {
            type: "button",
            text: "See all skills",
            class: "Apply btn-view",
          });
          $(".company-content").last().append(btnskill);
          let skillBtn = $(".btn-view:last");
          let curr=obj[i];
          let c=i;
          skillBtn.on("click",function () {
            $("."+c).append(
              $("<div>", { type: "div", class: "skill-form" })
            );     
            var skills = $("<span>", {
              type: "span",
              text: "All skills are: " + curr['candidate']["jobKeywords"],
              class: "package",
            });
            $(".skill-form").last().append(skills);
            skillBtn.prop("disabled", true);
        });
        i++;
      }
    }
  });
}
  function loadRecruiterJobs() {
    $.ajax({
      url: "http://localhost:3000/api/job",
      method: "GET",
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      success: function (obj) {
        var i = 0;
        while (i < obj.length) {
          $(".companies").append(
            $("<div>", { type: "div", class: "company-list" })
          );
          $(".company-list")
            .last()
            .append($("<div>", { type: "div", class: "row" }));
          $(".row")
            .last()
            .append(
              $("<div>", { type: "div", class: "maincol col-md-10 col-sm-10" })
            );
          $(".maincol")
            .last()
            .append($("<div>", { type: "div", class: "company-content "+i }));
          var title = $("<h3>", { type: "h3", text: obj[i]["title"] });
          var jobtype = $("<span>", {
            type: "span",
            text: obj[i]["type"],
            class: "full-time",
          });
          title.append(jobtype);
          $(".company-content").last().append(title);
          var details = $("<p>", { type: "p" });
          var location2 = $("<span>", {
            type: "span",
            text: obj[i]["location"],
            class: "location",
          });
          var ctc = $("<span>", {
            type: "span",
            text: "$" + obj[i]["ctc"],
            class: "package",
          });
          details.append(location2);
          details.append(ctc);
          $(".company-content").last().append(details);
          var btndetails = $("<button>", {
            type: "button",
            text: "View details",
            class: "Apply btn-view",
          });
          $(".company-content").last().append(btndetails);
          let detailsBtn = $(".btn-view:last");
          let curr=obj[i];
          let c=i;
          detailsBtn.on("click",function () {
            $("."+c).append(
              $("<div>", { type: "div", class: "detail-form" })
            );     
            var about= $("<span>", {
              type: "span",
              text: "About: " + curr["about"],
              class: "package",
            });
            var qualification= $("<span>", {
              type: "span",
              text: "Qualifications required: " + curr["qualification"],
              class: "package",
            });
            $(".detail-form").last().append(about);
            $(".detail-form").last().append("</br>");
            $(".detail-form").last().append(qualification);
            detailsBtn.prop("disabled", true);
        });
          var btnapply = $("<button>", {
            type: "button",
            text: "View Applied Candidates",
            class: "Apply btn-view",
          });
          $(".company-content").last().append(btnapply);
          let applyBtn = $(".btn-view:last");
          applyBtn.on("click",function () {
            window.location = "applied_candidates?job="+curr["_id"];
          });
          i++;
        }
      },
    });
  }
function loadAllCompaniesData() {
    $.ajax({
      url: "http://localhost:3000/api/recruiter",
      method: "GET",
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      success: function (obj) {
        var i = 0;
        while (i < obj.length) {
          $(".companies").append(
            $("<div>", { type: "div", class: "company-list" })
          );
          $(".company-list")
            .last()
            .append($("<div>", { type: "div", class: "row" }));
          $(".row")
            .last()
            .append(
              $("<div>", { type: "div", class: "maincol col-md-10 col-sm-10" })
            );
          $(".maincol")
            .last()
            .append($("<div>", { type: "div", class: "company-content" }));
          var title = $("<h3>", { type: "h3", text: obj[i]["name"] });
          $(".company-content").last().append(title);
          var details = $("<p>", { type: "p" });
          var emailid = $("<span>", {
            type: "span",
            text: "Email Id: " + obj[i]["email"],
            class: "location",
          });
          var phoneno = $("<span>", {
            type: "span",
            text: "Phone Number: " + obj[i]["phone"],
            class: "package",
          });
          details.append(emailid);
          details.append(phoneno);
          $(".company-content").last().append(details);
          i++;
        }
      },
    });
  }
  function loadappliedjobs(){
    $.ajax({
      url: "http://localhost:3000/api/job/me",
      method: "GET",
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      success: function (obj) {
        var i = 0;
        while (i < obj.length) {
          $(".companies").append(
            $("<div>", { type: "div", class: "company-list" })
          );
          $(".company-list")
            .last()
            .append($("<div>", { type: "div", class: "row" }));
          $(".row")
            .last()
            .append(
              $("<div>", { type: "div", class: "maincol col-md-10 col-sm-10" })
            );
          $(".maincol")
            .last()
            .append($("<div>", { type: "div", class: "company-content" }));
          var title = $("<h3>", { type: "h3", text: obj[i]['jobID']["title"] });
          var jobtype = $("<span>", {
            type: "span",
            text: obj[i]['jobID']["type"],
            class: "full-time",
          });
          title.append(jobtype);
          $(".company-content").last().append(title);
          var details = $("<p>", { type: "p" });
          var companyname = $("<span>", {
            type: "span",
            text: obj[i]['jobID']["companyName"],
            class: "location",
          });
          var location2 = $("<span>", {
            type: "span",
            text: obj[i]['jobID']["location"],
            class: "location",
          });
          var ctc = $("<span>", {
            type: "span",
            text: "$" + obj[i]['jobID']["ctc"],
            class: "package",
          });
          details.append(companyname);
          details.append(location2);
          details.append(ctc);
          $(".company-content").last().append(details);
          i++;
        }
      },
    });
  }