import { tweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

if (!localStorage.getItem("tweets")) {
    storeDataToLocalStorage(tweetsData)
}

document.addEventListener('click', function(e){
    if(e.target.dataset.like) {
       handleLikeClick(e.target.dataset.like) 
    } else if(e.target.dataset.retweet) {
        handleRetweetClick(e.target.dataset.retweet)
    } else if(e.target.dataset.reply) {
        toggleReplyVisibility(e.target.dataset.reply)
    } else if (e.target.dataset.delete) {
        handleDeleteClick(e.target.dataset.delete)
    } else if(e.target.id === 'tweet-btn') {
        handleTweetBtnClick()
    } else if (e.target.dataset.tweetReply) {
        onTweetReplyButtonClick(e.target.dataset.tweetReply)
    }
})

function storeDataToLocalStorage(tweetsData) {
    localStorage.setItem("tweets", JSON.stringify(tweetsData))
}

function replaceTweetObject(tweetsLocalStorage, targetTweetObj, tweetId) {
    let indexToReplace = tweetsLocalStorage.findIndex(function(tweet) {
        return tweet.uuid === tweetId
    })
    tweetsLocalStorage.splice(indexToReplace, 1, targetTweetObj)
    storeDataToLocalStorage(tweetsLocalStorage)
}

function onTweetReplyButtonClick(replyId) {
    const replyInput = document.getElementById(`tweet-reply-input-${replyId}`)
    let tweetsLocalStorage = JSON.parse(localStorage.getItem("tweets"))

    if (replyInput.value) {
        const targetTweetObj = tweetsLocalStorage.filter(function(tweet) {
            return tweet.uuid === replyId
        })[0]

        targetTweetObj.replies.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            tweetText: `${replyInput.value}`,
        })

        replaceTweetObject(tweetsLocalStorage, targetTweetObj, replyId)
        render()
        toggleReplyVisibility(replyId)
    }
}
 
function handleLikeClick(tweetId){ 
    let tweetsLocalStorage = JSON.parse(localStorage.getItem("tweets"))

    const targetTweetObj = tweetsLocalStorage.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked){
        targetTweetObj.likes--
    }
    else{
        targetTweetObj.likes++ 
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked

    replaceTweetObject(tweetsLocalStorage, targetTweetObj, tweetId)
    render()
}

function handleRetweetClick(tweetId){
    let tweetsLocalStorage = JSON.parse(localStorage.getItem("tweets"))
    
    const targetTweetObj = tweetsLocalStorage.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--
    }
    else{
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted

    replaceTweetObject(tweetsLocalStorage, targetTweetObj, tweetId)
    render() 
}

function handleDeleteClick(tweetId) {
    let tweetsLocalStorage = JSON.parse(localStorage.getItem("tweets"))

    tweetsLocalStorage = tweetsLocalStorage.filter(function(tweet) {
        return tweet.uuid !== tweetId
    })

    storeDataToLocalStorage(tweetsLocalStorage)
    render()
}

function toggleReplyVisibility(replyId){
    document.getElementById(`replies-${replyId}`).classList.toggle('hidden')
}

function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput.value){
        tweetsData.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            canDelete: true,
            uuid: uuidv4()
        })
        storeDataToLocalStorage(tweetsData)
        render()
        tweetInput.value = ''
    }

}

function getFeedHtml(){
    let feedHtml = ``

    let tweets = JSON.parse(localStorage.getItem("tweets"))
    
    tweets.forEach(function(tweet){
        
        let likeIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        let retweetIconClass = ''
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }

        let deleteIconElement = ''

        if (tweet.canDelete) {
            deleteIconElement = `
                <span class="tweet-detail">
                    <i class="fa-solid fa-trash"
                    data-delete="${tweet.uuid}"
                    ></i>
                </span>
            `
        }
        
        let repliesHtml = `
        <div class="tweet-reply">
            <div class="tweet-input-area">
                <img src="images/scrimbalogo.png" class="profile-pic">
                <textarea placeholder="Reply..." id="tweet-reply-input-${tweet.uuid}"></textarea>
            </div>
            <button id="reply-btn-${tweet.uuid}" data-tweet-reply="${tweet.uuid}">Reply</button>
        </div>
        `
        
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                repliesHtml+=`
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${reply.handle}</p>
            <p class="tweet-text">${reply.tweetText}</p>
        </div>
    </div>
</div>
`
            })
        }
        
          
        feedHtml += `
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
                ${deleteIconElement}
            </div>   
        </div>            
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
    </div>   
</div>
`
   })
   return feedHtml 
}

function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
}

render()

