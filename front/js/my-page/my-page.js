import { API_BASE_URL } from '../../config/config.js';

// DOMContentLoaded 이벤트 리스너
document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        alert('로그인이 필요합니다.');
        window.location.href = './log-in.html';
        return;
    }

    try {
        // 포인트 정보 가져오기
        console.log(API_BASE_URL);
        const response = await fetch(`${API_BASE_URL}/points/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (response.ok) {
            const result = await response.json();
            displayUserPoints(result.data);
        } else {
            alert('포인트 정보를 불러오는 데 실패했습니다.');
        }

        // 작성한 게시글 정보 가져오기
        const postResponse = await fetch(`${API_BASE_URL}/users/me/posts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (postResponse.ok) {
            const postResult = await postResponse.json();
            displayUserPosts(postResult.data);
        } else {
            alert('작성한 게시글 정보를 불러오는 데 실패했습니다.');
        }

        // 작성한 댓글 정보 가져오기
        const commentResponse = await fetch(`${API_BASE_URL}/users/me/comments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (commentResponse.ok) {
            const commentResult = await commentResponse.json();
            displayUserComments(commentResult.data);
        } else {
            alert('작성한 댓글 정보를 불러오는 데 실패했습니다.');
        }

    } catch (error) {
        console.error('Error fetching point data:', error);
        alert('포인트 정보를 불러오는 중 오류가 발생했습니다.');
    }
});

function displayUserPoints(data) {
    if (!data) {
        console.error('displayUserPoints: 데이터가 정의되지 않았거나 null입니다.');
        return;
    }

    const profileNickname = document.getElementById('profileNickname');
    const totalPoints = document.getElementById('totalPoints');
    const level = document.getElementById('level');

    const attention = document.getElementById('attention');
    const post = document.getElementById('post');
    const postLike = document.getElementById('postLike');
    const comment = document.getElementById('comment');
    const commentLike = document.getElementById('commentLike');

    const userLevel = Math.floor(data.totalPoint / 100) + 1;

    if (profileNickname) {
        profileNickname.innerText = data.nickname || '닉네임';
    } else {
        console.error('profileNickname 요소를 찾을 수 없습니다.');
    }

    if (totalPoints) {
        totalPoints.innerText = `포인트: ${data.totalPoint}`;
    } else {
        console.error('totalPoints 요소를 찾을 수 없습니다.');
    }

    if (level) {
        level.innerText = `LV.${userLevel} 멤버`;
    } else {
        console.error('level 요소를 찾을 수 없습니다.');
    }

    if (attention) {
        attention.innerText = `${data.counts.attention}/${data.maxCounts.attention}`;
    } else {
        console.error('attention 요소를 찾을 수 없습니다.');
    }

    if (post) {
        post.innerText = `${data.counts.post}/${data.maxCounts.post}`;
    } else {
        console.error('post 요소를 찾을 수 없습니다.');
    }

    if (postLike) {
        postLike.innerText = `${data.counts.postLike}/${data.maxCounts.postLike}`;
    } else {
        console.error('postLike 요소를 찾을 수 없습니다.');
    }

    if (comment) {
        comment.innerText = `${data.counts.comment}/${data.maxCounts.comment}`;
    } else {
        console.error('comment 요소를 찾을 수 없습니다.');
    }

    if (commentLike) {
        commentLike.innerText = `${data.counts.commentLike}/${data.maxCounts.commentLike}`;
    } else {
        console.error('commentLike 요소를 찾을 수 없습니다.');
    }
}

function displayUserPosts(posts) {
    const myPostsList = document.getElementById('myPostsList');
    myPostsList.innerHTML = '';

    if (posts.length === 0) {
        myPostsList.innerHTML = '<li>게시글이 없습니다.</li>';
        return;
    }

    posts.forEach(post => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <p>${post.title}</p>
            <p>${new Date(post.createdAt).toLocaleString()}</p>
        `;
        myPostsList.appendChild(listItem);
    });
}

function displayUserComments(comments) {
    const myCommentsList = document.getElementById('myCommentsList');
    myCommentsList.innerHTML = '';

    if (comments.length === 0) {
        myCommentsList.innerHTML = '<li>댓글이 없습니다.</li>';
        return;
    }

    comments.forEach(comment => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <p>게시글: ${comment.postTitle}</p>
            <p>${comment.content}</p>
            <p>${new Date(comment.createdAt).toLocaleString()}</p>
        `;
        myCommentsList.appendChild(listItem);
    });
}