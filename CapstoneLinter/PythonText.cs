using System;
using Python.Runtime;

public class PythonTest
{
    public void RunPythonScript()
    {
        // Initialize the Python engine
        PythonEngine.Initialize();

        using (Py.GIL())
        {
            dynamic np = Py.Import("numpy");
            Console.WriteLine($"Numpy version: {np.__version__}");
        }

        PythonEngine.Shutdown();
    }
}
