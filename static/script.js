//drag & drop
const dropTarget = document.getElementById('dropTarget');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const resultCard = document.getElementById('resultCard');
const resultLabel = document.getElementById('resultLabel');
const resultConfidence = document.getElementById('resultConfidence');

//file upload or drag-and-drop
fileInput.addEventListener('change', handleFileUpload);
dropTarget.addEventListener('dragover', handleDragOver);
dropTarget.addEventListener('drop', handleFileDrop);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        previewImage(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleFileDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
        previewImage(file);
    }
}

function previewImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        imagePreview.src = e.target.result;
        classifyImage(file);
    };
    reader.readAsDataURL(file);
}

function classifyImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.prediction !== undefined) {
            displayResults(data.prediction);
        } else {
            alert('Error in prediction');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function displayResults(prediction) {
    resultCard.style.display = 'block';
    resultLabel.textContent = 'Category: ' + prediction;

    resultConfidence.textContent = ''; //clear previous tips
    console.log('Predicted class:', prediction);

    let message = ''; //unique tips for each category
        if (prediction === "Battery") {
            message = `<b>You can <u>recharge your battery</u>, <u>make low-power DIY projects like small LED lights</u>, or even <u>create a custom power bank!</u> </b> <br><br>
            <b>What to Do:</b> Reuse/Dispose <br><br>
            <iframe width="420" height="236.25" src="https://www.youtube.com/embed/qiUyMLdVyfI?si=e52xkPa8SRAm9GTb" title="YouTube video player" frameborder="0" allow="accelerometer; 
            // autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
        } else if (prediction === "Biological") {
            message = `<b>You can transform biological waste into <u>nutrient-rich soil</u> by composting!</b> <br><br>
            <b>What to Do:</b> Compost/Dispose <br><br>
            <iframe width="420" height="236.25" src="https://www.youtube.com/embed/Iw3rtPDwAIY?si=5OOnGdZWyTMNyrQt" title="YouTube video player" frameborder="0" allow="accelerometer; 
            // autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
        } else if (prediction === "Cardboard") {
            message = `📦 <b>You can make <u>DIY Storage Boxes</u>, <u>Plant Holders</u>, <u>Pet Beds</u>, <u>Forts</u>, and more with leftover cardboard!</b> 📦<br><br>
            <b>What to Do:</b> Reuse/Recycle <br><br>
            <iframe width="420" height="236.25" src="https://www.youtube.com/embed/9KpSfta5NtA?si=livy-We6eu4Fvrh-" title="YouTube video player" frameborder="0" allow="accelerometer; 
            // autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;        
        } else if (prediction === "Clothes") {
            message = `<b>You can make <u>Tote Bags</u>, <u>Shorts</u>, <u>Blankets</u>, <u>Pillows</u>, and more with leftover clothing!</b> <br><br>
            <b>What to Do:</b> Reuse/Donate <br><br>
            <iframe width="420" height="236.25" src="https://www.youtube.com/embed/zoMY4fJN1aU?si=T1rn_5XimL59fLDT" title="YouTube video player" frameborder="0" allow="accelerometer; 
            // autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;    
        } else if (prediction === "Glass") {
            message = `<b>You can transform old glass bottles and jars into useful or decorative items like <u>soap dispensers</u>, <u>terrariums</u>, <u>flower vases</u>, <u>planters</u>,
            and more!</b> <br><br>
            <b>What to Do:</b> Reuse/Dispose <br><br>
            <iframe width="420" height="236.25" src="https://www.youtube.com/embed/1cWuRyFNjho?si=_2CKrBCS4L0bYqMX" title="YouTube video player" frameborder="0" allow="accelerometer; 
            // autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
        } else if (prediction === "Metal") {
            message = `<b>You can turn scrap metal into <u>furniture</u>, <u>wall art</u>, <u>planters</u>, <u>storage containers</u>, <u>jewelry</u>, and more!</b> <br><br>
            <b>What to Do:</b> Reuse/Recycle <br><br>
            <iframe width="420" height="236.25" src="https://www.youtube.com/embed/67WlGwFw1T0?si=riC0yzt0m1Dt7tfu" title="YouTube video player" frameborder="0" allow="accelerometer; 
            // autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
        } else if (prediction === "Paper") {
            message = `<b>You can use paper for <u>arts and crafts</u>, <u>wrapping gifts</u>, <u>packing material</u>, <u>garden mulch<u/>, and more!</b> <br><br>
            <b>What to Do:</b> Reuse/Recycle <br><br>
            <iframe width="420" height="236.25" src="https://www.youtube.com/embed/GFFAueROMBk?si=dNxx-MXYi1LLyRmb" title="YouTube video player" frameborder="0" allow="accelerometer; 
            // autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
        } else if (prediction === "Plastic") {
            message = `<b>You can use plastic as <u>planters</u>, <u>watering cans</u>, <u>fun craft materials</u>, <u>storage containers</u>, and more!</b> <br><br>
            <b>What to Do:</b> Reuse/Recycle <br><br>
            <iframe width="420" height="236.25" src="https://www.youtube.com/embed/rEaqfA-1JnM?si=Bl3vOQvzBwSGejRr" title="YouTube video player" frameborder="0" allow="accelerometer; 
            // autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
        } else if (prediction === "Shoes") {
            message = `<b>You can use old shoes as <u>planters</u>, <u>dog toys</u>, <u>a fabric/lace donor</u>, <u>a storage system</u>, and more!</b> <br><br>
            <b>What to Do:</b> Reuse/Donate <br><br>
            <iframe width="420" height="236.25" src="https://www.youtube.com/embed/SmASoXRqcvE?si=kbnH9h4Zca5U_8cq" title="YouTube video player" frameborder="0" allow="accelerometer; 
            // autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
        } else if (prediction === "Trash") {
            message = `<b>Make sure you dispose of trash <u>the right way</u>!</b> <br><br>
            <b>What to Do:</b> Dispose <br><br>
            <iframe width="420" height="236.25" src="https://www.youtube.com/embed/YgLRtpicrvY?si=DZpnGhs5hHNXGzRF" title="YouTube video player" frameborder="0" allow="accelerometer; 
            // autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
        }
        //update the message text content
        resultConfidence.innerHTML = message;
    }