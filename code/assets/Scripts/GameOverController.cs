using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class GameOverController : MonoBehaviour {
    public static float percentComplete;
    public static int failedLevel;
    public GameObject menuSystemRoot;

	RectTransform yourCirlce;
	Text percent;
	float yourCircleSizeLerp = 0; // Current lerp amount for 
	bool isGameOver = false;

	void Awake () {
		yourCirlce = transform.Find ("YourCircle").GetComponent<RectTransform>();
		percent = transform.Find ("Percent").GetComponent<Text>();
        Invoke("GameOver", 4.2f);
        Invoke("ShowMenuSystem", 7.2f);
    }

    void ShowMenuSystem()
    {
        menuSystemRoot.SetActive(true);
        GetComponent<MenuSystem>().enabled = true;
    }

    // Callback from MenuSystem script
    void MenuChoice(int choice)
    {
        if (choice == 0)
        {
            SceneManager.LoadScene(failedLevel);
        }
        else
        {
            SceneManager.LoadScene(0);
        }
    }

    void GameOver()
    {
        isGameOver = true;
    }

	void Update ()
    {
        yourCirlce.localScale = Vector3.Lerp(Vector3.zero, Vector3.one, yourCircleSizeLerp);
        percent.text = "" + (int)(yourCircleSizeLerp * 100);

        if (isGameOver) {
			yourCircleSizeLerp = Mathf.Min (percentComplete, yourCircleSizeLerp + 0.4f * Time.deltaTime);
		}
	}
}
