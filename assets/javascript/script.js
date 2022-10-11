import data from "../../data.json" assert {type:"json"}

const containerMain = document.querySelector(".container");
const dataUserArray = Object.values(data.currentUser);
const showSection = "showinit";
//const exReg = /@[a-z]+/g;

let dataCommentsArray = getData();
let idmainComments = 5;
let isReplyPreviously = false;
let btnReply;
let btnEdit;
let btnDelete;
let btnSend;
let btnScorePlus;
let btnSocreMinus;
let options;
let modal;

function getData(){
    let getdata = window.localStorage.getItem("dataCommentsArray");
    getdata = JSON.parse(getdata);
    if(!getdata){
        //console.log("access data local invalid");
        getdata = Object.values(data.comments);
    }
    return getdata;
}

function createComment(content="",isReply=false,replyingTo={id:0,to:""}){
    let isReplyofReply = true;
    let newCommentArray = {
        id:idmainComments,
        content:content,
        createdAt: "now",
        score: 0,
        user:{
            image:dataUserArray[0],
            username: dataUserArray[1]
        },
        replies: []};
    
    const newReplyArray = {
        id:idmainComments,
        content:content,
        createdAt: "now",
        score: 0,
        user:{
            image:dataUserArray[0],
            username: dataUserArray[1]
            },
        replyingTo: replyingTo.to
        };

    if(isReply){
        dataCommentsArray.forEach((commentArray)=>{
            if(commentArray.id == replyingTo.id){
                commentArray.replies.push(newReplyArray);
                isReplyofReply = false;
            }
        });
        if(isReplyofReply){
            dataCommentsArray.forEach(commentArray=>{
                commentArray.replies.forEach(replyArray=>{
                    if(replyArray.id == replyingTo.id){
                        commentArray.replies.push(newReplyArray);
                }});
            })
        }
        //console.log(dataCommentsArray);
    }
    else{
        dataCommentsArray.push(newCommentArray);
        //console.log(dataCommentsArray);
    }
    idmainComments++;
}

function readComments(){
    let isReply = false;
    dataCommentsArray.forEach((commentArray)=>{
        isReply = false;
        drawSectionComment(commentArray,isReply);
        commentArray.replies.forEach((replyArray)=> {
            isReply = true;
            drawSectionComment(replyArray, isReply);
        });
    });
    
    isReply = false;
    const addCommentMaininnerHTML = drawSectionAddComment("main",isReply,showSection);
    containerMain.innerHTML += addCommentMaininnerHTML;
    initVaribles();
}

function updateComments(){
    containerMain.innerHTML = "";
    saveLocalStorage();
    readComments();
    initVaribles();
}

function updateComment(content,id){
    id = parseInt(id);

    dataCommentsArray.forEach((commentArray)=>{
        if(commentArray.id === id){
            //console.log(commentArray.id +" a modificar");
            commentArray.content = content;
        }
    });

    dataCommentsArray.forEach((commentArray)=>{
        commentArray.replies.forEach((replyArray)=>{
            if(replyArray.id === id){
                //console.log(replyArray.id + " a modificar");
                replyArray.content = content;
            }
        });
    });

    updateComments();
}

function updateScore(id,score){
    id = parseInt(id);
    score = parseInt(score);
    dataCommentsArray.forEach((commentArray)=>{
        if(commentArray.id === id){
            //console.log(commentArray.id +" a modificar");
            commentArray.score = score;
        }
    });

    dataCommentsArray.forEach((commentArray)=>{
        commentArray.replies.forEach((replyArray)=>{
            if(replyArray.id === id){
                //console.log(replyArray.id + " a modificar");
                replyArray.score = score;
            }
        });
    });

    updateComments();
}

function deleteComment(idComment=0){
    idComment = parseInt(idComment);

    dataCommentsArray.forEach((commentArray)=>{
            commentArray.replies = commentArray.replies.filter((replyArray)=>{
               return replyArray.id !== idComment;
            });
    });

    dataCommentsArray = dataCommentsArray.filter((commentArray)=>{
            return commentArray.id !== idComment;
    });

    updateComments();
}

function drawSectionComment(comment,isReply=false){
    
    let classforReply = "";
    let tagforOwnerComment = "";
    let showforOnwer = "";
    let showforOther = "showinit";
    let separatorinitReply = `
        <div class"reply-container">
        <div class="line"></div>`;
    let separatorfinalReply = '</div>'

    if(isReply){
        classforReply = "comment--reply" 
        tagforOwnerComment = `@${comment.replyingTo}`;
    }

    if(comment.user.username === dataUserArray[1]){
        showforOnwer = "showinit"
        showforOther = "";
    }

    const commentInnerHtml = `
    <section class="comment-container" id="sec-comment-${comment.id}">
    <article class="comment ${classforReply}">
    <header class="comment-title">
        <figure class="comment-title__figure">
        <img class="comment-title__figure-img" src="./assets/images/avatars/image-${comment.user.username}.webp" alt="avatar ${comment.user.username}">
        <figcaption class="comment-title__figure-nick">${comment.user.username}</figcaption>
        </figure>
        <span class="comment-title__owner ${showforOnwer}">you</span>
        <p class="comment-title__date">${comment.createdAt}</p>
    </header>
    <main class="comment-parraf">
        <p class="comment-parraf__text"><span class="comment-parraf__text-reply">${tagforOwnerComment}</span> ${comment.content}</p>
    </main>
    <footer class="comment-interaction">
        <div class="comment-interaction__score">
        <figure class="comment-interaction__score-figure">
            <img src="./assets/images/icon-plus.svg" alt="plus icon" name="plus" class="comment-interaction__score-figure-img">
            <input type="text" name="score-value" class="comment-interaction__score-figure-value" value="${comment.score}" readonly title="score comment value">
            <img src="./assets/images/icon-minus.svg" alt="minus icon" name="minus" class="comment-interaction__score-figure-img">
        </figure>
        </div>
        <div class="comment-interaction__options">
        <figure class="comment-interaction__options-figure ${showforOnwer}" id="btn-delete-${comment.id}" name="delete">
            <img class="comment-interaction__options-figure-img" src="./assets/images/icon-delete.svg" alt="delete icon">
            <figcaption class="comment-interaction__options-figure-label comment-interaction__options-figure-label--delete">Delete</figcaption>
        </figure>
        <figure class="comment-interaction__options-figure ${showforOther}" id="btn-reply-${comment.id}" name="reply">
            <img class="comment-interaction__options-figure-img" src="./assets/images/icon-reply.svg" alt="reply icon">
            <figcaption class="comment-interaction__options-figure-label">Reply</figcaption>
        </figure>
        <figure class="comment-interaction__options-figure ${showforOnwer}" id="btn-edit-${comment.id}" name="edit">
            <img class="comment-interaction__options-figure-img" src="./assets/images/icon-edit.svg" alt="edit icon">
            <figcaption class="comment-interaction__options-figure-label">Edit</figcaption>
        </figure>
        </div>
    </footer>
    </article>
    </section>`;

    const forReplyinnerHTML = drawSectionAddComment(comment.id,isReply,"");

    containerMain.innerHTML += commentInnerHtml + forReplyinnerHTML

}

function drawSectionAddComment(idComment,isReply,classAdd){
    let valueButtonDefault = "REPLY";
    let classforReply = "";
    isReply && (classforReply = "comment--reply");
    (idComment==="main")&& (valueButtonDefault="SEND");
    const addCommentinnerHTML = `
    <section class="add-comment-container" id="add-comment-${idComment}">
    <article class="add-comment ${classforReply} ${classAdd}">
        <textarea name="text-area-comment" cols="30" rows="10" class="add-comment__textarea" placeholder="Add a comment..."></textarea>
        <figure class="add-comment__figure">
        <img class="add-comment__figure-img" src="./assets/images/avatars/image-${dataUserArray[1]}.webp" alt="avatar">
        </figure>
        <input type="button" value="${valueButtonDefault}" class="add-comment__button" id="btn-add-${idComment}">
    </article>
    </section>
    `;
    return addCommentinnerHTML;
}

function initVaribles(){
    //console.log("Inicializando variables");
    btnScorePlus = document.querySelectorAll('[name="plus"]');
    btnSocreMinus = document.querySelectorAll('[name="minus"]');
    btnReply = document.querySelectorAll('[name="reply"]');
    btnEdit = document.querySelectorAll('[name="edit"]');
    btnDelete = document.querySelectorAll('[name="delete"]');
    options =  options = document.querySelectorAll(".modal-message__options-button");
    modal = document.querySelector(".modal");
    btnSend = document.querySelector('#add-comment-main .add-comment .add-comment__button');

    btnScorePlus.forEach((element)=>{
        element.addEventListener('click',()=>{
            let score = element.nextElementSibling.value;
            score++;
            element.nextElementSibling.value = score;
            let id = element.parentElement.parentElement.parentElement.parentElement.parentElement.id
            id = id.replace("sec-comment-","");
            console.log(score);
            updateScore(id,score);
        });
    });

    btnSocreMinus.forEach((element)=>{
        element.addEventListener('click',()=>{
            let score = element.previousElementSibling.value;
            score--;
            if(score<=0){score=0;}
            element.previousElementSibling.value = score;
            let id = element.parentElement.parentElement.parentElement.parentElement.parentElement.id
            id = id.replace("sec-comment-","");
            console.log(score);
            updateScore(id,score);
        });
    });

    btnReply.forEach((element)=>{
        element.addEventListener('click', ()=>{
            showAddCommentReply(element.id);
            });
    });

    btnEdit.forEach((element)=>{
        element.addEventListener('click', ()=>{
            showUpdateComment(element.id)
        });
    });

    btnDelete.forEach((element)=>{
        element.addEventListener('click', ()=>{
            showModalDelete(element.id)
        });
    });

    btnSend.addEventListener('click',()=>{
        addCommentMain();
    });

    options.forEach((element)=>{
        element.addEventListener('click',()=>{
            modal.classList.remove("show");
        });
    });
}

function showAddCommentReply(idSectionComment){
    //console.log("Show commment add");
    const refIdSection = idSectionComment.replace("btn-reply-","#add-comment-");
    const sectionComment = document.querySelector(`${refIdSection} .add-comment`);
    const refIdButton = idSectionComment.replace("btn-reply-","#btn-add-");
    const btnAddComment = document.querySelector(`${refIdButton}`);
    const refIdComment = idSectionComment.replace("btn-reply-","");
    let content = document.querySelector(`${refIdSection} .add-comment .add-comment__textarea`);
    let isReply = true;
    let toReply = "";
    sectionComment.classList.add("show");
    
    let found = dataCommentsArray.find(commentArray=>commentArray.id === parseInt(refIdComment));
    if(!found){
        dataCommentsArray.forEach(commentArray=> found = commentArray.replies.find(replyArray=>replyArray.id === parseInt(refIdComment)));
        isReply = true;
    }
    
    toReply = found.user.username;
    content.value = `@${toReply} `;

    const replyingTo = {id:refIdComment, to:toReply}

    btnAddComment.addEventListener('click',()=>{
        content = document.querySelector(`${refIdSection} .add-comment .add-comment__textarea`).value;
        if(content.length>(toReply.length+3)){
            content = content.replace(`@${toReply}`,"")
            createComment(content,isReply,replyingTo);
            updateComments();
            sectionComment.classList.remove("show");
            content = "";
        }
        else{
            btnAddComment.classList.add("error");
        }
    });  
    btnAddComment.classList.remove("error"); 
    //console.log(refIdSection);
}

function addCommentMain(){
    const content = document.querySelector("#add-comment-main .add-comment .add-comment__textarea").value;
    if(content.length>0){
        createComment(content);
        updateComments();
        btnSend.classList.remove("error");
    }
    else{
        btnSend.classList.add("error");
    }
}

function showModalDelete(idComment){
    const refId = idComment.replace("btn-delete-","");
    const options = document.querySelectorAll(".modal-message__options-button");
    let toDelete = false;
    
    modal.classList.add("show");

    options.forEach((element)=>{
      element.addEventListener('click', ()=>{
          modal.classList.remove("show");
          if(element.id === 'modal-delete'){
            toDelete = true;
          }
          toDelete && deleteComment(refId);
        });
    });

}

function showUpdateComment(idButtonComment){
    const idAddComment = idButtonComment.replace("btn-edit-","#add-comment-");
    const idComment = idButtonComment.replace("btn-edit-","#sec-comment-");
    const AddcommentArea = document.querySelector(`${idAddComment} .add-comment`);
    const CommentArea = document.querySelector(`${idComment} .comment`);
    const exReg = /@[a-z]+/g;

    const content = document.querySelector(`${idComment} .comment .comment-parraf .comment-parraf__text`).textContent;
    let newComment = document.querySelector(`${idAddComment} .add-comment .add-comment__textarea`);
    newComment.textContent = content;

    const idButtonUpdate = idButtonComment.replace("btn-edit-","#btn-add-");
    const bntUpdate = document.querySelector(`${idButtonUpdate}`);
    bntUpdate.value = "UPDATE";
    //console.log(content);

    AddcommentArea.classList.add("show");
    CommentArea.classList.add("noshow");

    let id = idButtonComment.replace("btn-edit-","");

    bntUpdate.addEventListener('click',()=>{
        newComment = document.querySelector(`${idAddComment} .add-comment .add-comment__textarea`).value;

        newComment = newComment.replace(exReg,"");
        let newCommentControl = newComment.replace(/ /g, "");
        
        if(newCommentControl.length > 3){
            updateComment(newComment,id);
            AddcommentArea.classList.remove("show");
            CommentArea.classList.remove("noshow");
        }
        else{
            bntUpdate.classList.add("error");
        }

    });

    bntUpdate.classList.remove("error");

    //console.log(idComment);
    //const bntUpdate = document.querySelector();
}

function saveLocalStorage(){
    const JsonArrayData = JSON.stringify(dataCommentsArray);
    window.localStorage.setItem("dataCommentsArray",JsonArrayData);
}

readComments();