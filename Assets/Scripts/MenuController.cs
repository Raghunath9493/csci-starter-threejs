using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class MenuController : MonoBehaviour {
    public Transform katamari;
    public float katamariSpeed;

    // Callback from MenuSystem script
    void MenuChoice(int choice)
    {
        if (choice == 0)
        {
            SceneManager.LoadScene(1);
        }
        else
        {
            Application.Quit();
        }
    }

    void Update () {
        katamari.Rotate(Vector3.back, katamariSpeed * Time.deltaTime);
    }
}
