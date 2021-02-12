function loadSearchJobs(e) {
  e.preventDefault();
  $(".companies").fadeOut();
  let config = {};
  let data = $("#search-job")
    .serializeArray()
    .map(function (item) {
      if (config[item.name]) {
        if (typeof config[item.name] === "string") {
          config[item.name] = [config[item.name]];
        }
        config[item.name].push(item.value);
      } else {
        if (item.value !== "") config[item.name] = item.value;
      }
    });
  data = config;
  const settings = {
    async: true,
    crossDomain: true,
    url: "http://localhost:3000/api/job/search",
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    processData: false,
    data: JSON.stringify(data),
  };

  $.ajax(settings).done(function (obj) {
    console.log(obj);
    $(".companies").fadeIn();
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
      var companyname = $("<span>", {
        type: "span",
        text: obj[i]["companyName"],
        class: "location",
      });
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
      details.append(companyname);
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
        text: "Apply",
        class: "Apply apply-btn",
      });
      $(".company-content").last().append(btnapply);
      let applyBtn = $(".apply-btn:last");
      applyBtn.on("click", function () {
        $.ajax({
          url: `http://localhost:3000/api/job/${curr._id}/apply`,
          method: "POST",
          data,
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          success: (response) => {
            console.log(response);
            applyBtn.text("Applied");
            applyBtn.prop("disabled", true);
            alert("Your resume has been sent to the recruiter");
          },
        });
      });
      i++;
    }
  });
}


