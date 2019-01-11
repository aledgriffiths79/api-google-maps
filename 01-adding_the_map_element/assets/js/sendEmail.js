function sendMail(contactForm) {                                    // Remember that the first argument to this method is our service ID, 
                                                                    // which is "gmail". The second argument is our template ID, which 
                                                                    // is "rosie".And the third argument is an object that contains the 
                                                                    // parameters.
    emailjs.send("gmail", "rosie", {
        "from_name": contactForm.name.value,
        "from_email": contactForm.emailaddress.value,
        "project_request": contactForm.projectsummary.value
    })
    .then(
        function(response) {
            console.log("SUCCESS", response);
        },
        function(error) {
            console.log("FAILED", error);
        }
    );
    return false;  // To block from loading a new page
}