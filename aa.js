const trackingLog = new Map();
const LIMIT_TIME = 3000
const log = console.log;

const checkTrackingLog = () => {
    trackingLog.forEach((v, k) => {
        log(`${k}: `,v);
    }
  );
}

const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      
      /** entry가 vp 범위 내에 들어왔을 때 */
      if(entry.isIntersecting) {
          log(`🚀 ~ ${entry.target.id}를 추적합니다.`)

            const setTimeoutId = setTimeout(
          /** 
           * LIMIT_TIME 후에도 해당 target이 viewport내에 있을 경우
           */
          () => {
            const isInViewport = isElementInViewport(entry.target);
            /** 
              * timeout후에도 viewport에 있는지 확인
              * 있다면 logging
              *  */
            if(!isInViewport) {
              log(`
              🚀 ~ ${entry.target.id}는 추적 종료 시점에 추적 범위를 벗어났습니다. 
              로깅과 추적을 종료합니다.
              `);

              observer.unobserve(entry.target);
              return
            }
              const currentLog = trackingLog.get(entry.target.id);

              trackingLog.set(entry.target.id, { 
                impression_first_in_page:currentLog.impression_first_in_page,
                impression_count: currentLog.impression_count ? currentLog.impression_count + 1 : 1,
                impression_time: new Date(), // impression_time 갱신
              });

              log(`
              🚀 ~ ${entry.target.id}의 추적을 종료합니다.
              재추적 조건을 만족하는 경우 다시 추적을 시작합니다.
              `);
              observer.unobserve(entry.target)
              /** setTimeout이 성공적으로 종료되었으면 해당 내용을 지워야 할까? */
          } , LIMIT_TIME);

        trackingLog.set(entry.target.id, {
          ...trackingLog.get(entry.target.id),
          impression_first_in_page: new Date(),
          setTimeoutId
        });

      } else {
        // 관찰 범위에서 이탈하였으므로 추적과 setTimeout을 종료
        log(`🚀 ~ ${entry.target.id}는 추적 범위를 이탈하여 추적을 종료합니다. `)

        if(trackingLog.has(entry.target.id)) {
          clearTimeout(trackingLog.get(entry.target.id).setTimeoutId);
        }
        observer.unobserve(entry.target)
      }
    });
};

const eachObserver = new IntersectionObserver(observerCallback, {
  root:null,
  rootMargin: '0px',
  threshold: 1
});

document.addEventListener('DOMContentLoaded', () => {
  appendElements()
  const targets = document.getElementsByClassName('trackingTarget');

  const vpObserver =
    new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      if(entry.isIntersecting) eachObserver.observe(entry.target);
    })
  },{
    root: null,
    rootMargin:'0px',
    threshold:1
  });

  for(let i = 0; i < targets.length; i++) {
    vpObserver.observe(targets[i]);
  }
});

const appendElements = (n = 50) => {
    for (let i = 0; i < n; i++) {
      const newElement = document.createElement('div');
      newElement.id = `trackingTarget_${i}`
      newElement.className = `trackingTarget`
      newElement.style.height = '200px';
      newElement.style.margin = '10px';
      newElement.style.backgroundColor = 'lightblue';
      newElement.textContent = `trackingTarget_${i}`;
      document.getElementById('mainContent').appendChild(newElement);
    }
}


const isElementInViewport = el => {
  const clientRect = el.getBoundingClientRect();
  return (
    clientRect.top >= 0 &&
    clientRect.left >= 0 &&
    clientRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && 
    clientRect.right <= (window.innerWidth || document.documentElement.clientWidth) 
  )
}



