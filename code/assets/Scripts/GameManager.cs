using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public enum GameState {
    Playing,
    Paused,
    Timeout,
    Won,
    GameOver
}

public class GameManager : MonoBehaviour {
    public static GameManager manager;

    [HideInInspector]
    public GameState state;

    public float minutes;
    public float desiredSizeIncrease;
    public Image size;
    public Image sizeMarker;
    public GameObject winMessage;
    public Text time;
    public Text itemLog;
    public Katamari katamari;
    public GameObject timeout;
    public GameObject pause;
    public AudioClip pauseSound;
    public AudioSource music;

    float startingSize;
    string[] items;

    bool infiniteTime;

    void Awake()
    {
        if (minutes < 0)
            infiniteTime = true;

        SetState(GameState.Playing);

        manager = this;

        startingSize = katamari.GetSize();
        items = new string[5];
        for (int i = 0; i < items.Length; i++)
            items[i] = "";
    }

    // Callback from MenuSystem script
    void MenuChoice(int choice)
    {
        if (choice == 0)
        {
            SetState(GameState.Playing);
        }
        else
        {
            SceneManager.LoadScene(0);
        }
    }

    public void OnPickup(string item) {
        for (int i = 0; i < items.Length - 1; i++) {
            items[i] = items[i + 1];
        }
        items[items.Length - 1] = item;

        itemLog.text = string.Join("\n", items);
    }

    bool WinCondition()
    {
        return katamari.GetSize() - startingSize >= desiredSizeIncrease;
    }

    void DecideGameover()
    {
        if (WinCondition())
        {
            SetState(GameState.Won);
        }
        else
        {
            SetState(GameState.GameOver);
        }
    }

    public void SetState(GameState state)
    {
        CancelInvoke("DecideGameover");
        this.state = state;
        switch (state)
        {
            case GameState.Playing:
                music.Play();
                Time.timeScale = 1;
                pause.SetActive(false);
                GetComponent<MenuSystem>().enabled = false;
                break;
            case GameState.Paused:
                music.Pause();
                Time.timeScale = 0;
                pause.SetActive(true);
                GetComponent<MenuSystem>().enabled = true;
                Camera.main.GetComponent<AudioSource>().PlayOneShot(pauseSound, 0.6f);
                break;
            case GameState.Timeout:
                timeout.SetActive(true);
                time.enabled = false;
                size.enabled = false;
                sizeMarker.enabled = false;
                itemLog.enabled = false;
                Invoke("DecideGameover", 3);
                break;
            case GameState.GameOver:
            case GameState.Won:
                GameOverController.percentComplete = (katamari.GetSize() - startingSize) / desiredSizeIncrease;
                GameOverController.failedLevel = SceneManager.GetActiveScene().buildIndex;

                var fade = GetComponent<FadeOut>();
                fade.enabled = true;
                fade.fadingIn = false;

                Invoke("NextScreen", 4);
                winMessage.SetActive(false);
                timeout.SetActive(false);
                break;
        }
    }

    void NextScreen()
    {
        Debug.Log(state);
        if (state == GameState.Won)
        {
            Debug.Log("Aaa");
            int nextLevel = 1 + SceneManager.GetActiveScene().buildIndex;
            SceneManager.LoadScene(nextLevel);
        }
        else
        {
            SceneManager.LoadScene("GameOver");
        }
    }

    void Update()
    {
        switch (state)
        {
            case GameState.Playing:
                if (!WinCondition())
                {
                    float curSize = katamari.GetSize();
                    size.rectTransform.localScale = Vector3.Lerp(Vector3.zero, Vector3.one, (curSize - startingSize) / desiredSizeIncrease);
                }
                else
                {
                    size.enabled = false;
                    sizeMarker.enabled = false;
                    winMessage.SetActive(true);
                }

                if (infiniteTime)
                {
                    time.text = "Timeless";
                }
                else
                {
                    minutes -= (Time.deltaTime / 60.0f);
                    minutes = Mathf.Max(0, minutes);

                    time.text = Mathf.CeilToInt(minutes) + "m";
                    if (minutes <= 1.0f)
                    {
                        time.color = new Color(0.9f, 0.2f, 0.2f);
                    }
                    if (minutes == 0)
                    {
                        SetState(GameState.Timeout);
                    }
                }
                

                if (Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown("joystick button 7"))
                {
                    SetState(GameState.Paused);
                }
                break;
            case GameState.Paused:
                if (Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown("joystick button 7"))
                {
                    SetState(GameState.Playing);
                }
                break;
            case GameState.Won:
            case GameState.GameOver:
                music.volume = Mathf.Max(0, music.volume - 0.5f * Time.deltaTime);
                break;
        }
    }
}
