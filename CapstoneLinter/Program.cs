using System;

class Program
{
    static void Main()
    {
        try
        {
            var pyTest = new PythonTest();
            pyTest.RunPythonScript();
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error running Python code:");
            Console.WriteLine(ex);
        }
    }
}
