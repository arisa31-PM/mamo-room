$(function () {
  const path = location.pathname;

  // ===============================
  // loading.html
  // ===============================
  if ($("body").hasClass("loading-page")) {
    const BASE_DIR = location.pathname.replace(/[^/]*$/, "");
    const NEXT_URL = BASE_DIR + "index.html";
    const SEEN_KEY = "loading_seen_v3";

    const $video = $("#loadingVideo"),
      v = $video.get(0);
    const $msg = $(".msg-box");
    const $fade = $(".fade-layer");

    const q = new URLSearchParams(location.search);
    const FORCE_SHOW =
      q.has("show") ||
      q.get("show") === "1" ||
      q.has("preview") ||
      q.get("preview") === "1";

    try {
      const seen =
        sessionStorage.getItem(SEEN_KEY) === "1" ||
        localStorage.getItem(SEEN_KEY) === "1";
      if (seen && !FORCE_SHOW) {
        location.replace(NEXT_URL);
        return;
      }
    } catch (e) {}

    // ==== 時間設定 ====
    const MSG_AT_MS = 5000;
    const SECOND_MSG_DELAY = 2000;
    const STAY_AFTER_SECOND_MS = 5000;

    let started = false;

    function goNext() {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
        localStorage.setItem(SEEN_KEY, "1");
      } catch (e) {}
      location.replace(NEXT_URL);
    }

    function startSeq() {
      if (started) return;
      started = true;

      setTimeout(() => {
        $msg
          .removeClass("variant-excite fade-out")
          .html(
            '<span class="red">どうろ</span>は <span class="red">あぶない</span>ことが いっぱい！<br>こうつうルールを まもって、じぶんの <span class="red">いのち</span>を まもろう！'
          )
          .attr("aria-hidden", "false")
          .addClass("show");

        setTimeout(() => {
          $msg
            .addClass("variant-excite")
            .html("さあ、いっしょにべんきょうしよう！");
          if (v) v.classList.add("is-dim"); 
          $fade.addClass("dim");

          setTimeout(() => {
            $fade.removeClass("dim").addClass("show"); 
            try {
              v.pause();
            } catch (e) {}
            setTimeout(goNext, 350); 
          }, STAY_AFTER_SECOND_MS);
        }, SECOND_MSG_DELAY);
      }, MSG_AT_MS);
    }

    if (v) v.addEventListener("playing", startSeq);
    $video.on("canplaythrough", () => {
      if (v) v.play().catch(() => {});
      startSeq();
    });
    $video.on("error", startSeq);
    setTimeout(startSeq, 3000);
  }

  // ===============================
  // index.html（トップ）
  // ===============================
  // BGM（存在すれば使う）
  const audioEl = document.getElementById("bgm");
  const audio = audioEl ? audioEl : new Audio();

  // クイズ開始
  if (path.includes("index.html") || path === "/" || path === "/index.html") {
    $("#quiz .click-btn").on("click", function (e) {
      e.preventDefault();

      const quizOrder = [...Array(10).keys()]
        .map((i) => i + 1)
        .sort(() => Math.random() - 0.5);
      localStorage.setItem("quizOrder", JSON.stringify(quizOrder));
      localStorage.setItem("currentQuizIndex", "0");
      localStorage.setItem("playPrologue", "true");

      try {
        audio.volume = 0.3;
      } catch {}
      Promise.resolve(audio.play())
        .catch(() => {})
        .finally(() => {
          setTimeout(() => {
            window.location.href = "start.html";
          }, 600);
        });
    });
  }

  // メインビジュアル・スライダー
  const slides = $(".mainvisual-slider img");
  let current = 0;
  function showNextSlide() {
    if (!slides.length) return;
    slides.eq(current).removeClass("active");
    current = (current + 1) % slides.length;
    slides.eq(current).addClass("active");
  }
  if (slides.length) setInterval(showNextSlide, 3000);

  // スクロールでフェードイン
  function fadeInOnScroll() {
    $(".fadein, .fadein-up").each(function () {
      const $el = $(this);
      const elemTop = $el.offset().top;
      const scroll = $(window).scrollTop();
      const windowHeight = $(window).height();
      if (scroll > elemTop - windowHeight + 100) $el.addClass("inview");
    });
  }
  $(window).on("scroll", fadeInOnScroll);
  fadeInOnScroll();

  // とびまるジャンプ
  $(".mascot").on("mouseenter", function () {
    const $this = $(this);
    $this.removeClass("jump").addClass("jump");
    setTimeout(() => $this.removeClass("jump"), 800);
  });

  // タイトルのアニメーション
  setTimeout(() => $(".tobimaru-title").addClass("active"), 0);
  setTimeout(() => $(".site-title").addClass("active"), 1000);
  setTimeout(() => $(".speech-bubble").addClass("active"), 2000);

  // カーソル追従（とびまる）
  const $tobimaru = $("#tobimaru-cursor");
  $(document).on("mousemove", function (e) {
    if (!$tobimaru.length) return;
    $tobimaru.css({
      transform: `translate(${e.clientX - 40}px, ${e.clientY - 40}px)`,
    });
  });

  // ===============================
  // ハンバーガーメニュー（背景スクロール固定・アンカー正確スクロール）
  // ===============================
  const $hamburger = $("#hamburgerMenu");
  const $menuPanel = $("#menuPanel");
  const $overlay = $("#overlay");
  const $redLight = $(".light.red");
  const $greenLight = $(".light.green");
  const $body = $("body");

  if ($hamburger.length) {
    // 初期ライト色
    $redLight.css("fill", "#f44336");
    $greenLight.css("fill", "#ccc");

    let savedScrollY = null;

    function openMenu() {
      if ($menuPanel.hasClass("open")) return;
      savedScrollY =
        window.pageYOffset || document.documentElement.scrollTop || 0;
      $body.addClass("scroll-lock").css("top", -savedScrollY + "px");
      $menuPanel.addClass("open").show();
      $overlay.addClass("show");
      $redLight.css("fill", "#ccc");
      $greenLight.css("fill", "#4caf50");
    }

    function closeMenu() {
      if (!$menuPanel.hasClass("open")) return;
      $menuPanel.removeClass("open").hide();
      $overlay.removeClass("show");
      $body.removeClass("scroll-lock").css("top", "");
      if (savedScrollY != null) window.scrollTo(0, savedScrollY);
      $redLight.css("fill", "#f44336");
      $greenLight.css("fill", "#ccc");
    }

    // ハンバーガー
    $hamburger.on("click", function (e) {
      e.preventDefault();
      $menuPanel.hasClass("open") ? closeMenu() : openMenu();
    });

    // オーバーレイで閉じる
    $overlay.on("click", closeMenu);

    // パネル内クリック（li 直押しでも a を拾う）
    $menuPanel.on("click", "li, a", function (e) {
      const $a = $(e.target).closest("a");
      if (!$a.length) return;

      const href = $a.attr("href") || "";
      if (href.startsWith("#")) {
        const $target = $(href);
        if (!$target.length) return;

        e.preventDefault();

        // 目的地は閉じる前に計算
        const dest = $target.offset().top;

        closeMenu();

        // レイアウト確定の次フレームでスクロール
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            try {
              window.scrollTo({ top: dest, behavior: "smooth" });
            } catch {
              $("html, body").animate({ scrollTop: dest }, 500);
            }
          });
        });

        savedScrollY = null;
      } else {
        closeMenu(); // 別ページ遷移はデフォルトのまま
      }
    });

    // ESC で閉じる
    $(document).on("keydown", function (e) {
      if (e.key === "Escape" && $menuPanel.hasClass("open")) closeMenu();
    });

    // ページ離脱時は閉じる（iOS戻る問題の保険）
    window.addEventListener("pagehide", () => closeMenu());
    window.addEventListener("beforeunload", () => closeMenu());
  }

  // ===============================
  // start.html（BGM再生・クイズ開始）
  // ===============================
  if (location.pathname.includes("start.html")) {
    const $startQuiz = $("#startQuiz");
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // スマホ以外はBGM自動再生
    if (!isMobile) {
      const prologue = document.getElementById("prologueSound");
      if (prologue) {
        prologue.volume = 0.3;
        prologue.loop = true;
        setTimeout(() => {
          prologue.play().catch(() => {});
        }, 100);
      }
    }

    // スタート
    $startQuiz.on("click", function (e) {
      e.preventDefault();
      const prologue = document.getElementById("prologueSound");
      if (prologue && !prologue.paused) {
        prologue.pause();
        prologue.currentTime = 0;
      }

      const quizOrder = [...Array(10).keys()]
        .map((i) => i + 1)
        .sort(() => Math.random() - 0.5);
      localStorage.setItem("quizOrder", JSON.stringify(quizOrder));
      localStorage.setItem("currentQuizIndex", "0");

      window.location.href = `quiz${quizOrder[0]}.html`;
    });
  }

  // ===============================
  // クイズページ共通処理
  // ===============================
  if ($(".quiz-option").length > 0) {
    const order = JSON.parse(localStorage.getItem("quizOrder") || "[]");
    const currentIndex = parseInt(
      localStorage.getItem("currentQuizIndex") || "0"
    );
    const questionNumber = order[currentIndex];
    const total = order.length;

    $(".quiz-number").text(`${currentIndex + 1}もんめ`);
    const remaining = total - (currentIndex + 1);
    $(".quiz-remaining").text(
      remaining === 0 ? "ラスト！" : `あと ${remaining} もん！`
    );

    $(".quiz-options").on("click", ".quiz-option", function () {
      const isCorrect =
        $(this).data("correct") === true || $(this).data("correct") === "true";
      const sound = new Audio(
        isCorrect ? "sound/correct.mp3" : "sound/wrong.mp3"
      );
      sound.play();
      $("#result-image").attr(
        "src",
        isCorrect ? "img/correct.png" : "img/wrong.png"
      );
      $("#result-overlay").removeClass("hidden").addClass("show");

      setTimeout(() => {
        localStorage.setItem(
          `quiz${questionNumber}`,
          isCorrect ? "correct" : "wrong"
        );
        window.location.href = `explanation${questionNumber}.html`;
      }, 2000);
    });

    const $container = $(".quiz-options");
    const $shuffled = $container.children().sort(() => Math.random() - 0.5);
    $container.empty().append($shuffled);
  }

  // ===============================
  // 解説ページ（explanation1〜10）
  // ===============================
  if (path.includes("explanation")) {
    const order = JSON.parse(localStorage.getItem("quizOrder") || "[]");
    let currentIndex = parseInt(
      localStorage.getItem("currentQuizIndex") || "0"
    );
    const nextIndex = currentIndex + 1;
    const nextQuizNumber = order[nextIndex];
    const $nextBtn = $(".click-btn");

    if (nextQuizNumber) {
      $nextBtn
        .attr("href", `quiz${nextQuizNumber}.html`)
        .text("つぎのもんだいへ");
      $nextBtn.on("click", function () {
        localStorage.setItem("currentQuizIndex", nextIndex);
      });
    } else {
      $nextBtn.removeAttr("href").text("けっかはっぴょう");
      $nextBtn.on("click", function (e) {
        e.preventDefault();
        const sparkle = new Audio("sound/sparkle.mp3");
        sparkle.volume = 1.0;
        sparkle.play().catch(() => {});
        localStorage.setItem("currentQuizIndex", nextIndex);
        localStorage.setItem("allowAudio", "true");
        window.location.href = "result.html";
      });
    }
  }

  // ===============================
  // explanation10.html：結果ページへ遷移時に sparkle 再生
  // ===============================
  if (path.includes("explanation10.html")) {
    $("#toResult").on("click", function (e) {
      e.preventDefault();
      const sparkle = new Audio("sound/sparkle.mp3");
      sparkle.volume = 1.0;
      sparkle.play().finally(() => {
        localStorage.setItem("allowAudio", "true");
        window.location.href = "result.html";
      });
    });
  }

  // ===============================
  // result.html
  // ===============================
  if (path.includes("result.html")) {
    let correctCount = 0;
    for (let i = 1; i <= 10; i++) {
      if (localStorage.getItem(`quiz${i}`) === "correct") correctCount++;
    }
    $("#score").text(correctCount);
    const message =
      correctCount === 10
        ? "こうつうあんぜんマスターにんてい！"
        : "10もんせいかいをめざしてがんばろう！";
    $("#message").text(message);

    const allow = localStorage.getItem("allowAudio");
    if (allow === "true") {
      const s = new Audio(
        correctCount === 10 ? "sound/level-up.mp3" : "sound/sparkle.mp3"
      );
      s.volume = 1.0;
      s.play().finally(() => {
        localStorage.removeItem("allowAudio");
      });
    }

    // もういちどちょうせん！
    $("#restartQuiz").on("click", function (e) {
      e.preventDefault();
      const newOrder = [...Array(10).keys()]
        .map((i) => i + 1)
        .sort(() => Math.random() - 0.5);
      localStorage.setItem("quizOrder", JSON.stringify(newOrder));
      localStorage.setItem("currentQuizIndex", "0");
      window.location.href = `quiz${newOrder[0]}.html`;
    });
  }
});
