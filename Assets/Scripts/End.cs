using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class End : MonoBehaviour {
    public GameObject menuSystem;

	void Start () {
        GetComponent<MenuSystem>().enabled = false;
        Invoke("ShowMenu", 5);
	}
	
	void ShowMenu () {
        GetComponent<MenuSystem>().enabled = true;
        menuSystem.SetActive(true);
    }

    // Callback from MenuSystem script
    void MenuChoice(int choice)
    {
        if (choice == 0)
        {
            SceneManager.LoadScene(2);
        }
        else
        {
            SceneManager.LoadScene(0);
        }
    }
}
